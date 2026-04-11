import type { PointerEvent } from 'react';
import { Avatar, Button } from '@shared/ui/heroui';
import type { Translate } from './settings-form.types';

import styles from './styles.module.css';

const CROPPER_SIZE = 280;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.01;

type Position = { x: number; y: number };

type DisplayedSize = { width: number; height: number } | null;

type PhotoEditorModalProps = {
  imageUrl: string;
  displayedSize: DisplayedSize;
  position: Position;
  zoom: number;
  isApplyingCrop: boolean;
  userName: string;
  t: Translate;
  onImageLoad: () => void;
  onZoomChange: (value: number) => void;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
  onApply: () => void;
  onCancel: () => void;
  imageRef: React.RefObject<HTMLImageElement | null>;
};

export function PhotoEditorModal({
  displayedSize,
  imageRef,
  imageUrl,
  isApplyingCrop,
  onApply,
  onCancel,
  onImageLoad,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onZoomChange,
  position,
  t,
  userName,
  zoom,
}: PhotoEditorModalProps) {
  return (
    <div className={styles.modalOverlay} role="presentation">
      <div className={styles.modalPanel}>
        <div className={styles.modalHeading}>
          <h3 className={styles.modalTitle}>{t('settings.editor.title')}</h3>
          <p className={styles.modalDescription}>{t('settings.editor.description')}</p>
        </div>

        <div className={styles.editorGrid}>
          <div className={styles.cropCol}>
            <div
              className={styles.cropArea}
              role="presentation"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <img
                ref={imageRef}
                alt={t('settings.editor.imageAlt')}
                className={styles.cropImage}
                draggable={false}
                src={imageUrl}
                style={{
                  height: displayedSize?.height ?? 'auto',
                  left: position.x,
                  top: position.y,
                  width: displayedSize?.width ?? 'auto',
                }}
                onLoad={onImageLoad}
              />
            </div>
            <p className={styles.dragHint}>{t('settings.editor.dragHint')}</p>

            <label className={styles.zoomRow}>
              <span className={styles.zoomLabel}>{t('settings.editor.zoomLabel')}</span>
              <input
                className={styles.zoomSlider}
                max={MAX_ZOOM}
                min={MIN_ZOOM}
                step={ZOOM_STEP}
                type="range"
                value={zoom}
                onChange={event => onZoomChange(Number(event.target.value))}
              />
            </label>
          </div>

          <div className={styles.previewCol}>
            <p className={styles.previewLabel}>{t('settings.editor.previewLabel')}</p>
            <div className={styles.previewCircle}>
              {displayedSize ? (
                <img
                  alt={t('settings.editor.imageAlt')}
                  className={styles.previewImage}
                  draggable={false}
                  src={imageUrl}
                  style={{
                    height: (displayedSize.height * 96) / CROPPER_SIZE,
                    left: (position.x * 96) / CROPPER_SIZE,
                    top: (position.y * 96) / CROPPER_SIZE,
                    width: (displayedSize.width * 96) / CROPPER_SIZE,
                  }}
                />
              ) : (
                <Avatar className={styles.previewAvatar} name={userName} src={imageUrl} />
              )}
            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <Button isDisabled={isApplyingCrop} type="button" variant="light" onPress={onCancel}>
            {t('settings.editor.cancel')}
          </Button>
          <Button color="primary" isLoading={isApplyingCrop} type="button" onPress={onApply}>
            {isApplyingCrop ? t('settings.editor.applying') : t('settings.editor.apply')}
          </Button>
        </div>
      </div>
    </div>
  );
}
