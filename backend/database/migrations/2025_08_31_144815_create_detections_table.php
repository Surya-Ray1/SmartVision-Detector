<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration {
public function up(): void
{
Schema::create('detections', function (Blueprint $table) {
$table->id();
$table->string('source')->nullable(); // 'camera' | 'upload' | 'remote'
$table->string('image_path')->nullable(); // stored image (optional)
$table->json('results'); // array of {bbox:[x,y,w,h], class, score}
$table->timestamps();
});
}


public function down(): void
{
Schema::dropIfExists('detections');
}
};