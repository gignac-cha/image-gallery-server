import { useCallback } from 'react';

interface SettingsDialogProps {
  gridUnit: number;
  onGridUnitChange: (value: number) => void;
  onClose: () => void;
}

export function SettingsDialog({ gridUnit, onGridUnitChange, onClose }: SettingsDialogProps) {
  const handleSliderChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onGridUnitChange(Number(event.target.value));
    },
    [onGridUnitChange],
  );

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="settings-dialog__header">
          <span className="settings-dialog__title">Settings</span>
          <button className="settings-dialog__close" onClick={onClose}>{'\u00d7'}</button>
        </div>
        <div className="settings-dialog__body">
          <label className="settings-dialog__label">
            <span>Grid Unit</span>
            <span className="settings-dialog__value">{gridUnit}px</span>
          </label>
          <input
            className="settings-dialog__slider"
            type="range"
            min="8"
            max="128"
            step="8"
            value={gridUnit}
            onChange={handleSliderChange}
          />
          <div className="settings-dialog__range">
            <span>8px</span>
            <span>128px</span>
          </div>
        </div>
      </div>
    </div>
  );
}
