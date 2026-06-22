'use client';

import { useState, KeyboardEvent } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Loader2, Sparkles } from 'lucide-react';
import { useMutation } from '@apollo/client/react';
import { VenueCategory } from '@/types/venue';
import { CATEGORY_LABELS } from '@/lib/venue-constants';
import { SUBMIT_VENUE } from '@/lib/graphql/queries';

const SUBMIT_REGIONS = ['홍대/연남', '강남', '이태원', '성수', '기타'] as const;
const CATEGORIES = Object.entries(CATEGORY_LABELS) as [VenueCategory, string][];
const STEPS = ['기본 정보', '위치', '상세'];

interface Form {
  title: string;
  category: VenueCategory | '';
  minPrice: string;
  isPriceUnknown: boolean;
  sourceUrl: string;
  locationName: string;
  locationAddress: string;
  locationRegion: string;
  imageUrl: string;
  tagInput: string;
  tags: string[];
  description: string;
}

const INITIAL: Form = {
  title: '',
  category: '',
  minPrice: '',
  isPriceUnknown: false,
  sourceUrl: '',
  locationName: '',
  locationAddress: '',
  locationRegion: '',
  imageUrl: '',
  tagInput: '',
  tags: [],
  description: '',
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const inputCls =
  'w-full bg-surface-alt border border-border text-text text-sm px-3 py-2 rounded-xl outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-text-muted';

const Field = ({
  label,
  error,
  required,
  hint,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-text">
        {label}
        {required && <span className="text-primary ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-text-muted">{hint}</p>}
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
};

const Step1 = ({
  form,
  errors,
  set,
}: {
  form: Form;
  errors: Record<string, string>;
  set: (k: keyof Form, v: unknown) => void;
}) => {
  return (
    <div className="p-5 space-y-4">
      <Field label="제목" required error={errors.title}>
        <input
          className={inputCls}
          placeholder="모임 이름을 입력해주세요"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          maxLength={100}
        />
      </Field>

      <Field label="카테고리" required error={errors.category}>
        <div className="grid grid-cols-3 gap-1.5">
          {CATEGORIES.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => set('category', value)}
              className={`px-2 py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                form.category === value
                  ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                  : 'bg-surface-alt border-border text-text-secondary hover:border-primary/40 hover:text-text'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="최소 금액" required error={errors.minPrice} hint="실제 금액이 다를 수 있어 최소 기준으로 입력해주세요">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              className={`${inputCls} flex-1`}
              type="number"
              placeholder="0"
              value={form.minPrice}
              onChange={(e) => set('minPrice', e.target.value)}
              disabled={form.isPriceUnknown}
              min={0}
            />
            <span className="text-sm text-text-secondary shrink-0">원</span>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => {
                const next = !form.isPriceUnknown;
                set('isPriceUnknown', next);
                if (next) set('minPrice', '');
              }}
              className={`w-4 h-4 rounded flex items-center justify-center border transition-colors cursor-pointer ${
                form.isPriceUnknown ? 'bg-primary border-primary' : 'border-border bg-surface-alt'
              }`}
            >
              {form.isPriceUnknown && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            <span className="text-xs text-text-secondary">금액 미정 (추후 확인 필요)</span>
          </label>
        </div>
      </Field>

      <Field
        label="원본 URL"
        required
        error={errors.sourceUrl}
        hint="모임 상세 정보를 확인할 수 있는 링크"
      >
        <input
          className={inputCls}
          placeholder="https://..."
          value={form.sourceUrl}
          onChange={(e) => set('sourceUrl', e.target.value)}
          type="url"
        />
      </Field>
    </div>
  );
};

const Step2 = ({
  form,
  errors,
  set,
}: {
  form: Form;
  errors: Record<string, string>;
  set: (k: keyof Form, v: unknown) => void;
}) => {
  return (
    <div className="p-5 space-y-4">
      <Field
        label="장소명"
        required
        error={errors.locationName}
        hint="방문자가 찾기 쉬운 이름으로 입력해주세요"
      >
        <input
          className={inputCls}
          placeholder="예: 홍대입구역 3번 출구 라운지"
          value={form.locationName}
          onChange={(e) => set('locationName', e.target.value)}
        />
      </Field>

      <Field label="도로명 주소" required error={errors.locationAddress}>
        <input
          className={inputCls}
          placeholder="예: 서울 마포구 와우산로 94"
          value={form.locationAddress}
          onChange={(e) => set('locationAddress', e.target.value)}
        />
      </Field>

      <Field label="지역" required error={errors.locationRegion}>
        <div className="flex flex-wrap gap-1.5">
          {SUBMIT_REGIONS.map((region) => (
            <button
              key={region}
              type="button"
              onClick={() => set('locationRegion', region)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                form.locationRegion === region
                  ? 'bg-primary border-primary text-white'
                  : 'bg-surface-alt border-border text-text-secondary hover:border-primary/40'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </Field>
    </div>
  );
};

const Step3 = ({
  form,
  errors,
  set,
  onTagAdd,
  onTagKeyDown,
}: {
  form: Form;
  errors: Record<string, string>;
  set: (k: keyof Form, v: unknown) => void;
  onTagAdd: () => void;
  onTagKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
}) => {
  return (
    <div className="p-5 space-y-4">
      <Field
        label="이미지 URL"
        error={errors.imageUrl}
        hint="없으면 관리자가 기본 이미지를 설정합니다"
      >
        <input
          className={inputCls}
          placeholder="https://... (선택사항)"
          value={form.imageUrl}
          onChange={(e) => set('imageUrl', e.target.value)}
          type="url"
        />
      </Field>

      <Field label="태그">
        <div className="bg-surface-alt border border-border rounded-xl p-2.5 focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 font-bold"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => set('tags', form.tags.filter((t) => t !== tag))}
                    className="hover:text-red-400 transition-colors"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <input
              className="flex-1 bg-transparent text-text text-sm outline-none placeholder:text-text-muted"
              placeholder="태그 입력 후 Enter (예: 20대, 와인)"
              value={form.tagInput}
              onChange={(e) => set('tagInput', e.target.value)}
              onKeyDown={onTagKeyDown}
            />
            <button
              type="button"
              onClick={onTagAdd}
              className="text-xs text-primary font-bold hover:opacity-70 transition-opacity shrink-0"
            >
              추가
            </button>
          </div>
        </div>
      </Field>

      <Field label="설명" required error={errors.description}>
        <textarea
          className={`${inputCls} resize-none`}
          placeholder="모임에 대해 자세히 설명해주세요"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={4}
          maxLength={500}
        />
        <p className="text-[11px] text-text-muted text-right">{form.description.length}/500</p>
      </Field>
    </div>
  );
};

const SuccessView = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
        <Sparkles className="w-7 h-7 text-primary" />
      </div>
      <div>
        <h3 className="font-black text-text text-base">등록 신청 완료!</h3>
        <p className="text-[13px] text-text-secondary mt-2 leading-relaxed">
          검토 후 지도에 표시됩니다.
          <br />
          보통 1~2일 이내에 처리됩니다.
        </p>
      </div>
      <button
        onClick={onClose}
        className="mt-2 px-8 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-black transition-colors"
      >
        확인
      </button>
    </div>
  );
};

const SubmitVenueModal = ({ isOpen, onClose }: Props) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [submitVenue, { loading }] = useMutation(SUBMIT_VENUE);

  const set = (field: keyof Form, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field as string];
      return next;
    });
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!form.title.trim()) e.title = '제목을 입력해주세요';
      if (!form.category) e.category = '카테고리를 선택해주세요';
      if (!form.isPriceUnknown && !form.minPrice) e.minPrice = '최소 금액을 입력해주세요';
      if (!form.sourceUrl.trim()) e.sourceUrl = '원본 URL을 입력해주세요';
    } else if (step === 1) {
      if (!form.locationName.trim()) e.locationName = '장소명을 입력해주세요';
      if (!form.locationAddress.trim()) e.locationAddress = '주소를 입력해주세요';
      if (!form.locationRegion) e.locationRegion = '지역을 선택해주세요';
    } else {
      if (!form.description.trim()) e.description = '설명을 입력해주세요';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) setStep((s) => s + 1); };
  const handleBack = () => { setStep((s) => s - 1); setErrors({}); };

  const handleTagAdd = () => {
    const tag = form.tagInput.trim().replace(/^#/, '');
    if (tag && !form.tags.includes(tag)) set('tags', [...form.tags, tag]);
    set('tagInput', '');
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); handleTagAdd(); }
    if (e.key === 'Backspace' && !form.tagInput && form.tags.length > 0)
      set('tags', form.tags.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError('');
    try {
      await submitVenue({
        variables: {
          input: {
            title: form.title,
            category: form.category,
            minPrice: form.isPriceUnknown ? null : Number(form.minPrice),
            sourceUrl: form.sourceUrl,
            locationName: form.locationName,
            locationAddress: form.locationAddress,
            locationRegion: form.locationRegion,
            imageUrl: form.imageUrl || null,
            tags: form.tags,
            description: form.description,
          },
        },
      });
      setSubmitted(true);
    } catch {
      setSubmitError('제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleClose = () => {
    setStep(0);
    setForm(INITIAL);
    setErrors({});
    setSubmitted(false);
    setSubmitError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-surface-panel border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        <div className="h-1 w-full bg-gradient-to-r from-primary to-amber-400 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-sm font-black text-text">모임 등록</h2>
            <p className="text-[11px] text-text-muted mt-0.5">검토 후 지도에 표시됩니다</p>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-elevated transition-colors"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {/* Step indicator */}
        {!submitted && (
          <div className="flex items-center px-5 py-3 border-b border-border gap-1 shrink-0">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center gap-1">
                {i > 0 && (
                  <div className={`h-px w-6 transition-colors ${i <= step ? 'bg-primary' : 'bg-border'}`} />
                )}
                <div
                  className={`flex items-center gap-1.5 text-[11px] font-bold transition-colors ${
                    i === step ? 'text-primary' : i < step ? 'text-primary/60' : 'text-text-muted'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border transition-all shrink-0 ${
                      i < step
                        ? 'bg-primary border-primary text-white'
                        : i === step
                          ? 'border-primary text-primary'
                          : 'border-border text-text-muted'
                    }`}
                  >
                    {i < step ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  {label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {submitted ? (
            <SuccessView onClose={handleClose} />
          ) : step === 0 ? (
            <Step1 form={form} errors={errors} set={set} />
          ) : step === 1 ? (
            <Step2 form={form} errors={errors} set={set} />
          ) : (
            <Step3
              form={form}
              errors={errors}
              set={set}
              onTagAdd={handleTagAdd}
              onTagKeyDown={handleTagKeyDown}
            />
          )}
        </div>

        {/* Footer */}
        {!submitted && (
          <div className="px-5 py-4 border-t border-border flex items-center gap-2 shrink-0">
            {step > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-border text-xs font-bold text-text-secondary hover:bg-surface-elevated transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> 이전
              </button>
            )}
            {submitError && (
              <p className="text-[11px] text-red-400 flex-1 text-center">{submitError}</p>
            )}
            <div className="flex-1" />
            {step < 2 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black transition-colors"
              >
                다음 <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-60 text-white text-xs font-black transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                제출하기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default SubmitVenueModal;
