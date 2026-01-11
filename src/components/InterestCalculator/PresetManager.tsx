import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Save, FolderOpen, Trash2, Plus, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { InterestTier } from "@/lib/interest-calculator";

export interface Preset {
  id: string;
  name: string;
  depositAmount: string;
  interestType: 'simple' | 'compound';
  interestApply: 'daily' | 'monthly' | 'biannually' | 'annually';
  tiers: InterestTier[];
  createdAt: string;
}

interface PresetManagerProps {
  depositAmount: string;
  interestType: 'simple' | 'compound';
  interestApply: 'daily' | 'monthly' | 'biannually' | 'annually';
  tiers: InterestTier[];
  onLoadPreset: (preset: Preset) => void;
}

const STORAGE_KEY = 'interest-calculator-presets';

export function PresetManager({
  depositAmount,
  interestType,
  interestApply,
  tiers,
  onLoadPreset,
}: PresetManagerProps) {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");

  // Load presets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPresets(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load presets:', error);
    }
  }, []);

  // Save presets to localStorage
  const savePresetsToStorage = (updatedPresets: Preset[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPresets));
      setPresets(updatedPresets);
    } catch (error) {
      console.error('Failed to save presets:', error);
      toast.error('Failed to save preset');
    }
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }

    const newPreset: Preset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      depositAmount,
      interestType,
      interestApply,
      tiers: [...tiers],
      createdAt: new Date().toISOString(),
    };

    const updatedPresets = [...presets, newPreset];
    savePresetsToStorage(updatedPresets);
    
    setPresetName("");
    setSaveDialogOpen(false);
    toast.success(`Preset "${newPreset.name}" saved successfully`);
  };

  const handleLoadPreset = (preset: Preset) => {
    onLoadPreset(preset);
    toast.success(`Preset "${preset.name}" loaded successfully`);
  };

  const handleDeletePreset = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const preset = presets.find(p => p.id === presetId);
    const updatedPresets = presets.filter(p => p.id !== presetId);
    savePresetsToStorage(updatedPresets);
    toast.success(`Preset "${preset?.name}" deleted successfully`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInterestTypeLabel = (type: string) => {
    return type === 'simple' ? 'Simple' : 'Compound';
  };

  const getApplyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      daily: 'Daily',
      monthly: 'Monthly',
      biannually: 'Biannually',
      annually: 'Annually',
    };
    return labels[type] || type;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Save Preset Button */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save Preset</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookmarkCheck className="h-5 w-5 text-primary" />
              Save Preset
            </DialogTitle>
            <DialogDescription>
              Save current settings for future use
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Preset Name</label>
              <Input
                placeholder="e.g. Bank A Savings"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSavePreset();
                }}
              />
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
              <p className="font-medium text-foreground">Settings to save:</p>
              <p className="text-muted-foreground">
                • Deposit Amount: {depositAmount || '(not set)'}
              </p>
              <p className="text-muted-foreground">
                • Type: {getInterestTypeLabel(interestType)} / {getApplyTypeLabel(interestApply)}
              </p>
              <p className="text-muted-foreground">
                • Interest Rate Tiers: {tiers.length} tier{tiers.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePreset} className="gap-2">
              <Save className="h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Preset Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Load Preset</span>
            {presets.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 ml-1">
                {presets.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="flex items-center gap-2">
            <BookmarkCheck className="h-4 w-4" />
            Saved Presets
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {presets.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No presets saved yet</p>
              <p className="text-xs mt-1">Click "Save Preset" to get started</p>
            </div>
          ) : (
            presets.map((preset) => (
              <DropdownMenuItem
                key={preset.id}
                className="flex items-start justify-between gap-2 cursor-pointer p-2"
                onClick={() => handleLoadPreset(preset)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{preset.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {getInterestTypeLabel(preset.interestType)} • {getApplyTypeLabel(preset.interestApply)} • {preset.tiers.length} tier{preset.tiers.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created {formatDate(preset.createdAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                  onClick={(e) => handleDeletePreset(preset.id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
