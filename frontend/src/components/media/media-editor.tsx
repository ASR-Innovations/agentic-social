import { useState } from 'react';
import { Crop, Maximize2, Palette, Scissors, RotateCw, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { MediaAsset } from '@/hooks/useMediaLibrary';

interface MediaEditorProps {
  asset: MediaAsset;
  onSave: (editedAsset: Partial<MediaAsset>) => void;
  onClose: () => void;
}

export function MediaEditor({ asset, onSave, onClose }: MediaEditorProps) {
  const [activeTab, setActiveTab] = useState('crop');
  const [isSaving, setIsSaving] = useState(false);

  // Crop state
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropWidth, setCropWidth] = useState(100);
  const [cropHeight, setCropHeight] = useState(100);

  // Resize state
  const [resizeWidth, setResizeWidth] = useState(asset.dimensions?.width || 1920);
  const [resizeHeight, setResizeHeight] = useState(asset.dimensions?.height || 1080);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

  // Filter state
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);

  // Video trim state (for videos)
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(asset.duration || 0);

  const handleSave = async () => {
    setIsSaving(true);
    
    // In a real implementation, this would send the edits to the backend
    // which would process the image/video and return the new URL
    const editedAsset: Partial<MediaAsset> = {
      metadata: {
        ...asset.metadata,
        edits: {
          crop: { x: cropX, y: cropY, width: cropWidth, height: cropHeight },
          resize: { width: resizeWidth, height: resizeHeight },
          filters: { brightness, contrast, saturation, blur },
          ...(asset.type === 'VIDEO' && {
            trim: { start: trimStart, end: trimEnd },
          }),
        },
      },
    };

    await onSave(editedAsset);
    setIsSaving(false);
  };

  const getFilterStyle = () => {
    return {
      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`,
    };
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Media</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 h-[600px]">
          {/* Preview */}
          <div className="flex-1 bg-gray-950 rounded-lg overflow-hidden flex items-center justify-center">
            {asset.type === 'VIDEO' ? (
              <video
                src={asset.url}
                className="max-w-full max-h-full"
                style={getFilterStyle()}
                controls
              />
            ) : (
              <img
                src={asset.url}
                alt={asset.filename}
                className="max-w-full max-h-full object-contain"
                style={getFilterStyle()}
              />
            )}
          </div>

          {/* Editor Controls */}
          <div className="w-80 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                <TabsTrigger value="crop" className="data-[state=active]:bg-gray-700">
                  <Crop className="w-4 h-4 mr-2" />
                  Crop
                </TabsTrigger>
                <TabsTrigger value="resize" className="data-[state=active]:bg-gray-700">
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Resize
                </TabsTrigger>
                <TabsTrigger value="filters" className="data-[state=active]:bg-gray-700">
                  <Palette className="w-4 h-4 mr-2" />
                  Filters
                </TabsTrigger>
              </TabsList>

              {/* Crop Tab */}
              <TabsContent value="crop" className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">X Position</label>
                  <Slider
                    value={[cropX]}
                    onValueChange={([value]) => setCropX(value)}
                    max={100}
                    step={1}
                    className="mb-2"
                  />
                  <span className="text-xs text-gray-500">{cropX}%</span>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Y Position</label>
                  <Slider
                    value={[cropY]}
                    onValueChange={([value]) => setCropY(value)}
                    max={100}
                    step={1}
                    className="mb-2"
                  />
                  <span className="text-xs text-gray-500">{cropY}%</span>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Width</label>
                  <Slider
                    value={[cropWidth]}
                    onValueChange={([value]) => setCropWidth(value)}
                    max={100}
                    step={1}
                    className="mb-2"
                  />
                  <span className="text-xs text-gray-500">{cropWidth}%</span>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Height</label>
                  <Slider
                    value={[cropHeight]}
                    onValueChange={([value]) => setCropHeight(value)}
                    max={100}
                    step={1}
                    className="mb-2"
                  />
                  <span className="text-xs text-gray-500">{cropHeight}%</span>
                </div>

                <div className="pt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 text-white hover:bg-gray-800"
                    onClick={() => {
                      setCropX(0);
                      setCropY(0);
                      setCropWidth(100);
                      setCropHeight(100);
                    }}
                  >
                    Reset Crop
                  </Button>
                </div>
              </TabsContent>

              {/* Resize Tab */}
              <TabsContent value="resize" className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Width (px)</label>
                  <input
                    type="number"
                    value={resizeWidth}
                    onChange={(e) => {
                      const width = parseInt(e.target.value);
                      setResizeWidth(width);
                      if (maintainAspectRatio && asset.dimensions) {
                        const aspectRatio = asset.dimensions.width / asset.dimensions.height;
                        setResizeHeight(Math.round(width / aspectRatio));
                      }
                    }}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Height (px)</label>
                  <input
                    type="number"
                    value={resizeHeight}
                    onChange={(e) => {
                      const height = parseInt(e.target.value);
                      setResizeHeight(height);
                      if (maintainAspectRatio && asset.dimensions) {
                        const aspectRatio = asset.dimensions.width / asset.dimensions.height;
                        setResizeWidth(Math.round(height * aspectRatio));
                      }
                    }}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="aspect-ratio"
                    checked={maintainAspectRatio}
                    onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="aspect-ratio" className="text-sm text-gray-400">
                    Maintain aspect ratio
                  </label>
                </div>

                <div className="pt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 text-white hover:bg-gray-800"
                    onClick={() => {
                      if (asset.dimensions) {
                        setResizeWidth(asset.dimensions.width);
                        setResizeHeight(asset.dimensions.height);
                      }
                    }}
                  >
                    Reset to Original
                  </Button>
                </div>
              </TabsContent>

              {/* Filters Tab */}
              <TabsContent value="filters" className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Brightness</label>
                  <Slider
                    value={[brightness]}
                    onValueChange={([value]) => setBrightness(value)}
                    min={0}
                    max={200}
                    step={1}
                    className="mb-2"
                  />
                  <span className="text-xs text-gray-500">{brightness}%</span>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Contrast</label>
                  <Slider
                    value={[contrast]}
                    onValueChange={([value]) => setContrast(value)}
                    min={0}
                    max={200}
                    step={1}
                    className="mb-2"
                  />
                  <span className="text-xs text-gray-500">{contrast}%</span>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Saturation</label>
                  <Slider
                    value={[saturation]}
                    onValueChange={([value]) => setSaturation(value)}
                    min={0}
                    max={200}
                    step={1}
                    className="mb-2"
                  />
                  <span className="text-xs text-gray-500">{saturation}%</span>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Blur</label>
                  <Slider
                    value={[blur]}
                    onValueChange={([value]) => setBlur(value)}
                    min={0}
                    max={10}
                    step={0.5}
                    className="mb-2"
                  />
                  <span className="text-xs text-gray-500">{blur}px</span>
                </div>

                <div className="pt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 text-white hover:bg-gray-800"
                    onClick={() => {
                      setBrightness(100);
                      setContrast(100);
                      setSaturation(100);
                      setBlur(0);
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Video Trim (only for videos) */}
            {asset.type === 'VIDEO' && asset.duration && (
              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Scissors className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-medium">Trim Video</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                      Start Time (seconds)
                    </label>
                    <Slider
                      value={[trimStart]}
                      onValueChange={([value]) => setTrimStart(value)}
                      max={asset.duration}
                      step={0.1}
                      className="mb-2"
                    />
                    <span className="text-xs text-gray-500">{trimStart.toFixed(1)}s</span>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                      End Time (seconds)
                    </label>
                    <Slider
                      value={[trimEnd]}
                      onValueChange={([value]) => setTrimEnd(value)}
                      max={asset.duration}
                      step={0.1}
                      className="mb-2"
                    />
                    <span className="text-xs text-gray-500">{trimEnd.toFixed(1)}s</span>
                  </div>

                  <p className="text-xs text-gray-400">
                    Duration: {(trimEnd - trimStart).toFixed(1)}s
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
