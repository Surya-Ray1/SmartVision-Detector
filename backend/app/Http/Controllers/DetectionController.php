<?php
namespace App\Http\Controllers;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Detection;


class DetectionController extends Controller
{
/** List latest detections */
public function index(Request $request)
{
$limit = (int) $request->query('limit', 20);
return Detection::orderByDesc('created_at')->limit($limit)->get();
}


/** Store detection results (optional image upload) */
public function store(Request $request)
{
$validated = $request->validate([
'source' => 'nullable|string',
'results' => 'required|array',
'results.*.bbox' => 'required|array|size:4',
'results.*.class' => 'required|string',
'results.*.score' => 'required|numeric',
'image' => 'nullable|image|max:5120', // up to 5MB
]);


$path = null;
if ($request->hasFile('image')) {
$path = $request->file('image')->store('detections', 'public');
}


$det = Detection::create([
'source' => $validated['source'] ?? null,
'image_path' => $path,
'results' => $validated['results'],
]);


return response()->json($det, 201);
}


/** Retrieve one detection */
public function show(Detection $detection)
{
return $detection;
}
}