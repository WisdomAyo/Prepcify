<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\IngestionPage;
use App\Support\Enums\PageStatus;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class PdfSplitterService
{
    private const DPI = 200;

    private const IMAGE_FORMAT = 'PNG';

    /**
     * Download PDF from R2, split into per-page PNGs, upload each back to R2.
     *
     * @return array<int, array{page_number: int, r2_url: string}>
     */
    public function split(string $pdfUrl, int $jobId): array
    {
        $this->assertImagick();

        $tmpDir = sys_get_temp_dir().'/ingestion_'.$jobId.'_'.uniqid();
        @mkdir($tmpDir, 0755, true);

        try {
            $pdfPath = $tmpDir.'/source.pdf';
            $this->downloadFromR2($pdfUrl, $pdfPath);

            return $this->splitAndUpload($pdfPath, $tmpDir, $jobId);
        } finally {
            $this->cleanupTmp($tmpDir);
        }
    }

    public function pageCount(string $pdfUrl, int $jobId): int
    {
        $this->assertImagick();

        $tmpDir = sys_get_temp_dir().'/ingestion_count_'.$jobId.'_'.uniqid();
        @mkdir($tmpDir, 0755, true);

        try {
            $pdfPath = $tmpDir.'/source.pdf';
            $this->downloadFromR2($pdfUrl, $pdfPath);

            $imagick = new \Imagick;
            $imagick->pingImage($pdfPath);
            $totalPages = $imagick->getNumberImages();
            $imagick->clear();

            return $totalPages;
        } catch (\ImagickException $e) {
            throw new RuntimeException('Imagick failed to inspect PDF: '.$e->getMessage(), previous: $e);
        } finally {
            $this->cleanupTmp($tmpDir);
        }
    }

    private function assertImagick(): void
    {
        if (! extension_loaded('imagick')) {
            throw new RuntimeException('The imagick PHP extension is required for PDF splitting. See docs/DEPLOY.md.');
        }
    }

    private function downloadFromR2(string $r2Key, string $localPath): void
    {
        $contents = Storage::disk('r2')->get($r2Key);

        if ($contents === null) {
            throw new RuntimeException("PDF not found in R2 at key: {$r2Key}");
        }

        file_put_contents($localPath, $contents);
    }

    /**
     * @return array<int, array{page_number: int, r2_url: string}>
     */
    private function splitAndUpload(string $pdfPath, string $tmpDir, int $jobId): array
    {
        $results = [];

        try {
            $imagick = new \Imagick;
            $imagick->setResolution(self::DPI, self::DPI);
            $imagick->readImage($pdfPath);
            $totalPages = $imagick->getNumberImages();

            for ($page = 0; $page < $totalPages; $page++) {
                try {
                    $imagick->setIteratorIndex($page);
                    $frame = $imagick->getImage();
                    $frame->setImageFormat(strtolower(self::IMAGE_FORMAT));

                    $tmpImagePath = $tmpDir.'/page-'.($page + 1).'.png';
                    $frame->writeImage($tmpImagePath);
                    $frame->clear();

                    $r2Key = "ingestion/{$jobId}/page-".($page + 1).'.png';
                    $contents = file_get_contents($tmpImagePath);
                    if ($contents !== false) {
                        Storage::disk('r2')->put($r2Key, $contents);
                    }

                    $results[] = [
                        'page_number' => $page + 1,
                        'r2_url' => $r2Key,
                    ];
                } catch (\Throwable $e) {
                    Log::warning("IngestionJob {$jobId}: failed to split page ".($page + 1).': '.$e->getMessage());

                    IngestionPage::updateOrCreate(
                        ['ingestion_job_id' => $jobId, 'page_number' => $page + 1],
                        [
                            'page_image_url' => '',
                            'status' => PageStatus::Skipped->value,
                            'error' => 'Split failed: '.$e->getMessage(),
                        ],
                    );
                }
            }

            $imagick->clear();
        } catch (\ImagickException $e) {
            throw new RuntimeException('Imagick failed to open PDF: '.$e->getMessage(), previous: $e);
        }

        return $results;
    }

    private function cleanupTmp(string $tmpDir): void
    {
        if (! is_dir($tmpDir)) {
            return;
        }

        $files = glob($tmpDir.'/*') ?: [];
        foreach ($files as $file) {
            @unlink($file);
        }

        @rmdir($tmpDir);
    }
}
