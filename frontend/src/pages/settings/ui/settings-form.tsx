import type { ChangeEvent, FormEvent, PointerEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { MySettings } from '@entities/settings';
import { useUpdateMySettingsMutation } from '@entities/settings';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, FieldError, InputGroup, Label, TextField } from '@shared/ui/heroui';
import { PanelState } from '@shared/ui/panel-state';

import { PhotoEditorModal } from './photo-editor-modal';
import styles from './styles.module.css';

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp';
const ALLOWED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const PHONE_REGEX = /^\+[1-9]\d{7,14}$/;
const CROPPER_SIZE = 280;
const CROPPED_OUTPUT_SIZE = 512;

type Position = { x: number; y: number };

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getDisplayedSize(naturalWidth: number, naturalHeight: number, zoom: number) {
  const baseScale = Math.max(CROPPER_SIZE / naturalWidth, CROPPER_SIZE / naturalHeight);
  const scale = baseScale * zoom;
  return { width: naturalWidth * scale, height: naturalHeight * scale };
}

function clampPosition(position: Position, displayedWidth: number, displayedHeight: number): Position {
  return {
    x: clamp(position.x, CROPPER_SIZE - displayedWidth, 0),
    y: clamp(position.y, CROPPER_SIZE - displayedHeight, 0),
  };
}

function getCenteredPosition(displayedWidth: number, displayedHeight: number): Position {
  return {
    x: (CROPPER_SIZE - displayedWidth) / 2,
    y: (CROPPER_SIZE - displayedHeight) / 2,
  };
}

async function createCroppedFile({
  file,
  naturalWidth,
  naturalHeight,
  position,
  zoom,
}: {
  file: File;
  naturalWidth: number;
  naturalHeight: number;
  position: Position;
  zoom: number;
}): Promise<File> {
  const imageUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image decode failed'));
      img.src = imageUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = CROPPED_OUTPUT_SIZE;
    canvas.height = CROPPED_OUTPUT_SIZE;

    const displayed = getDisplayedSize(naturalWidth, naturalHeight, zoom);
    const sourceX = (-position.x * naturalWidth) / displayed.width;
    const sourceY = (-position.y * naturalHeight) / displayed.height;
    const sourceSize = (CROPPER_SIZE * naturalWidth) / displayed.width;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas context unavailable');

    context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, CROPPED_OUTPUT_SIZE, CROPPED_OUTPUT_SIZE);

    const blob = await new Promise<Blob | null>(resolve => {
      canvas.toBlob(resolve, file.type || 'image/png', 0.92);
    });
    if (!blob) throw new Error('Canvas export failed');

    return new File([blob], file.name, { type: blob.type || file.type, lastModified: Date.now() });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function validatePhone(phone: string, fallbackMessage: string): string | null {
  if (!phone) return null;
  return PHONE_REGEX.test(phone) ? null : fallbackMessage;
}

type SettingsFormProps = {
  data: MySettings;
};

export function SettingsForm({ data }: SettingsFormProps) {
  const { t } = useTranslation();
  const updateSettings = useUpdateMySettingsMutation();

  const [phoneDraft, setPhoneDraft] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorImageFile, setEditorImageFile] = useState<File | null>(null);
  const [editorZoom, setEditorZoom] = useState(1);
  const [editorPosition, setEditorPosition] = useState<Position>({ x: 0, y: 0 });
  const [editorNaturalSize, setEditorNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [isApplyingCrop, setIsApplyingCrop] = useState(false);

  const dragStateRef = useRef<{
    pointerId: number;
    startPointerX: number;
    startPointerY: number;
    startX: number;
    startY: number;
  } | null>(null);
  const editorImageRef = useRef<HTMLImageElement | null>(null);

  const selectedPhotoPreview = useMemo(
    () => (selectedPhoto ? URL.createObjectURL(selectedPhoto) : null),
    [selectedPhoto]
  );
  const editorImageUrl = useMemo(
    () => (editorImageFile ? URL.createObjectURL(editorImageFile) : null),
    [editorImageFile]
  );
  const editorDisplayedSize = useMemo(() => {
    if (!editorNaturalSize) return null;
    return getDisplayedSize(editorNaturalSize.width, editorNaturalSize.height, editorZoom);
  }, [editorNaturalSize, editorZoom]);

  useEffect(
    () => () => { if (selectedPhotoPreview) URL.revokeObjectURL(selectedPhotoPreview); },
    [selectedPhotoPreview]
  );

  useEffect(
    () => () => { if (editorImageUrl) URL.revokeObjectURL(editorImageUrl); },
    [editorImageUrl]
  );

  useEffect(() => {
    if (!editorOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isApplyingCrop) {
        setEditorOpen(false);
        setEditorImageFile(null);
        setEditorNaturalSize(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [editorOpen, isApplyingCrop]);

  const handlePhotoSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!file) return;
    if (!ALLOWED_PHOTO_TYPES.has(file.type)) { setPhotoError(t('settings.validation.photoType')); return; }
    if (file.size > MAX_PHOTO_SIZE_BYTES) { setPhotoError(t('settings.validation.photoSize')); return; }
    setPhotoError(null);
    setEditorImageFile(file);
    setEditorZoom(1);
    setEditorPosition({ x: 0, y: 0 });
    setEditorNaturalSize(null);
    setEditorOpen(true);
    setRemovePhoto(false);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditorImageFile(null);
    setEditorNaturalSize(null);
  };

  const handleEditorImageLoad = () => {
    const image = editorImageRef.current;
    if (!image) return;
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;
    if (!naturalWidth || !naturalHeight) return;
    setEditorNaturalSize({ width: naturalWidth, height: naturalHeight });
    const displayed = getDisplayedSize(naturalWidth, naturalHeight, editorZoom);
    setEditorPosition(getCenteredPosition(displayed.width, displayed.height));
  };

  const handleZoomChange = (value: number) => {
    if (!editorNaturalSize || !editorDisplayedSize) { setEditorZoom(value); return; }
    const oldDisplayed = editorDisplayedSize;
    const centerXInImage = ((CROPPER_SIZE / 2 - editorPosition.x) / oldDisplayed.width) * editorNaturalSize.width;
    const centerYInImage = ((CROPPER_SIZE / 2 - editorPosition.y) / oldDisplayed.height) * editorNaturalSize.height;
    const nextDisplayed = getDisplayedSize(editorNaturalSize.width, editorNaturalSize.height, value);
    const nextX = CROPPER_SIZE / 2 - (centerXInImage / editorNaturalSize.width) * nextDisplayed.width;
    const nextY = CROPPER_SIZE / 2 - (centerYInImage / editorNaturalSize.height) * nextDisplayed.height;
    setEditorZoom(value);
    setEditorPosition(clampPosition({ x: nextX, y: nextY }, nextDisplayed.width, nextDisplayed.height));
  };

  const handleCropPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!editorDisplayedSize || isApplyingCrop) return;
    dragStateRef.current = {
      pointerId: event.pointerId,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startX: editorPosition.x,
      startY: editorPosition.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleCropPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!editorDisplayedSize || !dragStateRef.current || dragStateRef.current.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - dragStateRef.current.startPointerX;
    const deltaY = event.clientY - dragStateRef.current.startPointerY;
    setEditorPosition(clampPosition(
      { x: dragStateRef.current.startX + deltaX, y: dragStateRef.current.startY + deltaY },
      editorDisplayedSize.width,
      editorDisplayedSize.height
    ));
  };

  const handleCropPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current?.pointerId !== event.pointerId) return;
    dragStateRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const applyCrop = async () => {
    if (!editorImageFile || !editorNaturalSize) return;
    setIsApplyingCrop(true);
    setPhotoError(null);
    try {
      const croppedFile = await createCroppedFile({
        file: editorImageFile,
        naturalWidth: editorNaturalSize.width,
        naturalHeight: editorNaturalSize.height,
        position: editorPosition,
        zoom: editorZoom,
      });
      if (croppedFile.size > MAX_PHOTO_SIZE_BYTES) {
        setPhotoError(t('settings.validation.photoProcessedSize'));
        setIsApplyingCrop(false);
        return;
      }
      setSelectedPhoto(croppedFile);
      setRemovePhoto(false);
      closeEditor();
    } catch {
      setPhotoError(t('settings.editor.processError'));
    } finally {
      setIsApplyingCrop(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const phone = phoneDraft ?? data.phone ?? '';
    const normalizedPhone = phone.trim();
    const phoneValidationMessage = validatePhone(normalizedPhone, t('settings.validation.phoneE164'));
    if (phoneValidationMessage) { setPhoneError(phoneValidationMessage); return; }
    setPhoneError(null);
    try {
      await updateSettings.mutateAsync({
        phone: normalizedPhone ? normalizedPhone : null,
        photo: selectedPhoto,
        removePhoto: selectedPhoto ? undefined : removePhoto ? true : undefined,
      });
      setPhoneDraft(null);
      setPhoneError(null);
      setPhotoError(null);
      setSelectedPhoto(null);
      setRemovePhoto(false);
    } catch {
      // Error state is rendered from mutation state below.
    }
  };

  const avatarSrc = removePhoto ? null : (selectedPhotoPreview ?? data.photoUrl);
  const hasPhoto = Boolean(avatarSrc);
  const phoneValue = phoneDraft ?? data.phone ?? '';

  return (
    <>
      <form className="w-full" onSubmit={handleSubmit}>
        {/* Avatar row */}
        <div className={styles.avatarRow}>
          <div className={styles.avatarCenter}>
            <Avatar className={styles.avatar} name={data.fullName} src={avatarSrc ?? undefined} />
            {selectedPhoto ? (
              <p className={styles.photoFileName}>{t('settings.photo.selectedFile', { fileName: selectedPhoto.name })}</p>
            ) : (
              <p className={styles.photoHint}>{t('settings.photo.hint')}</p>
            )}
            {photoError ? <p className={styles.photoError}>{photoError}</p> : null}
          </div>

          <div className={styles.avatarButtons}>
            <label className={styles.uploadLabel}>
              <input accept={PHOTO_ACCEPT} className="hidden" type="file" onChange={handlePhotoSelect} />
              <span className={styles.uploadBtn}>{t('settings.actions.uploadPhoto')}</span>
            </label>
            <Button
              isDisabled={!hasPhoto}
              size="sm"
              type="button"
              variant="flat"
              onPress={() => { setSelectedPhoto(null); setRemovePhoto(true); }}
            >
              {t('settings.actions.removePhoto')}
            </Button>
            {removePhoto ? (
              <Button size="sm" type="button" variant="light" onPress={() => setRemovePhoto(false)}>
                {t('settings.actions.cancelRemovePhoto')}
              </Button>
            ) : null}
          </div>
        </div>

        {/* Fields table */}
        <div className={styles.table}>
          <div className={styles.tableRow}>
            <span className={styles.tableLabel}>{t('settings.fields.fullName')}</span>
            <span className={styles.tableValue}>{data.fullName}</span>
          </div>
          <div className={styles.tableRow}>
            <span className={styles.tableLabel}>{t('settings.fields.email')}</span>
            <span className={styles.tableValue}>{data.email}</span>
          </div>
          <div className={styles.tableRow}>
            <span className={styles.tableLabel}>{t('settings.fields.role')}</span>
            <span className={styles.tableValue}>{t(`roles.byCode.${data.role}`)}</span>
          </div>
          <div className={styles.tableRow}>
            <span className={styles.tableLabel}>{t('settings.fields.phone')}</span>
            <div className={styles.tableValueCol}>
              <TextField fullWidth isInvalid={!!phoneError}>
                <Label className="sr-only">{t('settings.fields.phone')}</Label>
                <InputGroup aria-label={t('settings.fields.phone')} fullWidth>
                  <InputGroup.Input
                    placeholder={t('settings.fields.phonePlaceholder')}
                    type="tel"
                    value={phoneValue}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      setPhoneDraft(event.target.value);
                      if (phoneError) setPhoneError(null);
                    }}
                  />
                </InputGroup>
                {phoneError ? <FieldError>{phoneError}</FieldError> : null}
              </TextField>
            </div>
          </div>
        </div>

        {updateSettings.error ? (
          <div className="mt-4">
            <PanelState
              description={updateSettings.error.message}
              title={t('settings.state.saveErrorTitle')}
              tone="danger"
            />
          </div>
        ) : null}

        <div className={styles.submitRow}>
          <Button color="primary" isLoading={updateSettings.isPending} type="submit">
            {updateSettings.isPending ? t('settings.actions.saving') : t('settings.actions.save')}
          </Button>
        </div>
      </form>

      {editorOpen && editorImageUrl ? (
        <PhotoEditorModal
          displayedSize={editorDisplayedSize}
          imageRef={editorImageRef}
          imageUrl={editorImageUrl}
          isApplyingCrop={isApplyingCrop}
          position={editorPosition}
          t={t}
          userName={data.fullName}
          zoom={editorZoom}
          onApply={() => void applyCrop()}
          onCancel={closeEditor}
          onImageLoad={handleEditorImageLoad}
          onPointerDown={handleCropPointerDown}
          onPointerMove={handleCropPointerMove}
          onPointerUp={handleCropPointerUp}
          onZoomChange={handleZoomChange}
        />
      ) : null}
    </>
  );
}
