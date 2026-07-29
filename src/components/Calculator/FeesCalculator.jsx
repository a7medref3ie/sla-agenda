import { useState } from 'react';
import {
  Calculator, Coins, ShieldCheck, ChevronDown, ChevronUp,
  FileText, Copy, Check, RefreshCw, ArrowLeft, Info
} from 'lucide-react';
import './Calculator.css';

export function calculateJudicialFees(money) {
  const inputNum = parseFloat(money) || 0;
  if (inputNum <= 0) return null;

  let prevStage = 0;
  let prevPersent = 0;
  let percentage = 2;

  if (inputNum <= 250) {
    prevStage = 0;
    prevPersent = 0;
    percentage = 2;
  } else if (inputNum <= 2000) {
    prevStage = 250;
    prevPersent = 5;
    percentage = 3;
  } else if (inputNum <= 4000) {
    prevStage = 2000;
    prevPersent = 57.50;
    percentage = 4;
  } else {
    prevStage = 4000;
    prevPersent = 137.50;
    percentage = 5;
  }

  const extraPersent = ((inputNum - prevStage) * percentage) / 100;
  const persent = extraPersent + prevPersent;

  // الرسم المستحق عند رفع الدعوى
  let persentGiven = 0;
  if (inputNum <= 1000) {
    persentGiven = persent;
  } else if (inputNum <= 40000) {
    persentGiven = 27.5;
  } else if (inputNum <= 100000) {
    persentGiven = 57.5;
  } else if (inputNum <= 1000000) {
    persentGiven = 187.5;
  } else {
    persentGiven = 437.5;
  }

  const netPersent = persent - persentGiven;
  const box = persent / 2;
  const boxGiven = persentGiven / 2;
  const netBox = box - boxGiven;

  return {
    inputNum,
    prevStage,
    prevPersent,
    percentage,
    extraPersent,
    persent,
    persentGiven,
    netPersent,
    box,
    boxGiven,
    netBox,
    totalNetRequired: netPersent + netBox,
  };
}

export default function FeesCalculator() {
  const [amount, setAmount] = useState('');
  const [showSteps, setShowSteps] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = calculateJudicialFees(amount);

  const formatEGP = (val) => {
    if (val === undefined || val === null) return '0.00';
    return Number(val).toLocaleString('ar-EG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleCopyText = () => {
    if (!result) return;
    const text = `بيان حساب الرسوم القضائية:
- قيمة الدعوى: ${formatEGP(result.inputNum)} جنيه
- الرسم النسبي الإجمالي: ${formatEGP(result.persent)} جنيه
- الرسم النسبي المستحق عند الرفع: ${formatEGP(result.persentGiven)} جنيه
- صافي الرسم النسبي المطلوب: ${formatEGP(result.netPersent)} جنيه
- رسم صندوق الخدمات الإجمالي: ${formatEGP(result.box)} جنيه
- صافي رسم الصندوق المطلوب: ${formatEGP(result.netBox)} جنيه
- إجمالي المبالغ المستحقة السداد: ${formatEGP(result.totalNetRequired)} جنيه`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presets = [1000, 10000, 50000, 100000, 500000, 1000000];

  return (
    <div className="calculator-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title flex items-center gap-3">
          <Calculator className="icon text-gold" size={28} />
          حاسبة الرسوم القضائية
        </h1>
        <p className="page-subtitle">
          حساب الرسم النسبي ورسم صندوق الخدمات القضائية بالتفصيل وبدقة طبقاً لقيمة الدعوى.
        </p>
      </div>

      {/* Calculator Input Card */}
      <div className="glass-card calc-input-card mb-6">
        <div className="form-group mb-4">
          <label className="form-label font-bold text-base mb-2 flex items-center gap-2">
            <Coins size={18} className="text-gold" />
            قيمة المطالبة / الدعوى (بالجنيه المصري) *
          </label>
          <div className="calc-input-wrapper">
            <input
              type="number"
              min="1"
              step="any"
              className="form-input calc-main-input"
              placeholder="مثال: 50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
            <span className="currency-suffix">جنيه مصري</span>
          </div>
        </div>

        {/* Quick Amount Presets */}
        <div className="calc-presets flex items-center gap-2 flex-wrap mb-2">
          <span className="text-xs text-muted font-bold ml-2">مبالغ سريعة:</span>
          {presets.map((val) => (
            <button
              key={val}
              className={`preset-btn ${Number(amount) === val ? 'active' : ''}`}
              onClick={() => setAmount(val.toString())}
            >
              {val.toLocaleString()} ج
            </button>
          ))}
          {amount && (
            <button
              className="preset-btn text-danger mr-auto"
              onClick={() => setAmount('')}
            >
              <RefreshCw size={12} /> مسح
            </button>
          )}
        </div>
      </div>

      {/* Results Display Area */}
      {result ? (
        <div className="calc-results-section animate-fadeIn">
          {/* Main 2 Cards Grid */}
          <div className="grid-2 gap-6 mb-6">
            {/* Card 1: الرسم النسبي */}
            <div className="glass-card fee-card fee-card-gold">
              <div className="fee-card-header">
                <h3 className="fee-card-title text-gold">الرسم النسبي</h3>
                <span className="badge badge-gold">نسبة الشرائح</span>
              </div>

              <div className="fee-card-body">
                <div className="fee-row">
                  <span className="fee-label">إجمالاً:</span>
                  <span className="fee-value text-lg font-bold">{formatEGP(result.persent)} ج</span>
                </div>

                <div className="fee-row">
                  <span className="fee-label">المسدد عند رفع الدعوى:</span>
                  <span className="fee-value text-muted">{formatEGP(result.persentGiven)} ج</span>
                </div>

                <div className="fee-row highlight-row mt-3 p-2 rounded">
                  <span className="fee-label font-bold text-gold">الصافي المطلوب سداده:</span>
                  <span className="fee-value font-extrabold text-gold text-xl">{formatEGP(result.netPersent)} ج</span>
                </div>
              </div>
            </div>

            {/* Card 2: رسم صندوق الخدمات */}
            <div className="glass-card fee-card fee-card-purple">
              <div className="fee-card-header">
                <h3 className="fee-card-title text-purple">رسم صندوق الخدمات القضائية</h3>
                <span className="badge badge-purple">50% من النسبي</span>
              </div>

              <div className="fee-card-body">
                <div className="fee-row">
                  <span className="fee-label">إجمالاً:</span>
                  <span className="fee-value text-lg font-bold">{formatEGP(result.box)} ج</span>
                </div>

                <div className="fee-row">
                  <span className="fee-label">المسدد عند رفع الدعوى:</span>
                  <span className="fee-value text-muted">{formatEGP(result.boxGiven)} ج</span>
                </div>

                <div className="fee-row highlight-row mt-3 p-2 rounded">
                  <span className="fee-label font-bold text-purple">الصافي المطلوب سداده:</span>
                  <span className="fee-value font-extrabold text-purple text-xl">{formatEGP(result.netBox)} ج</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grand Total Summary Box */}
          <div className="glass-card total-summary-box mb-6 p-6 text-center">
            <div className="text-xs text-muted font-bold mb-1">إجمالي الصافي المطلوب سداده (الرسم النسبي + صندوق الخدمات)</div>
            <div className="grand-total-amount text-3xl font-black text-gold my-2">
              {formatEGP(result.totalNetRequired)} <span className="text-base font-normal">جنيه مصري</span>
            </div>
            <button className="btn btn-sm btn-outline mt-3 mx-auto flex items-center gap-2" onClick={handleCopyText}>
              {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              <span>{copied ? 'تم نسخ التقرير' : 'نسخ التقرير المالي'}</span>
            </button>
          </div>

          {/* Detailed Legal Calculation Steps (Accordion) */}
          <div className="glass-card steps-card">
            <button
              className="steps-toggle-btn w-full flex items-center justify-between p-4"
              onClick={() => setShowSteps(!showSteps)}
            >
              <span className="flex items-center gap-2 font-bold text-base text-primary">
                <FileText size={18} className="text-gold" />
                عرض تفاصيل خطوات الحساب القانونية
              </span>
              {showSteps ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {showSteps && (
              <div className="steps-content-body p-6 border-t border-light">
                <p className="text-sm mb-3">
                  حيث أن قيمة الدعوى الصادر عنها أمر التقدير هي <strong>{formatEGP(result.inputNum)} جنيه</strong>، فيكون حسابها كالتالي:
                </p>

                <div className="steps-list flex flex-col gap-2 text-xs leading-relaxed">
                  {result.inputNum > 250 && (
                    <div className="step-item p-2 rounded bg-tertiary">
                      📌 الرسم النسبي لأول {result.prevStage.toLocaleString()} جنيه = <strong>{result.prevPersent} جنيه</strong>.
                    </div>
                  )}

                  {result.inputNum > 250 && (
                    <div className="step-item p-2 rounded bg-tertiary">
                      📌 المتبقي من المبلغ: {formatEGP(result.inputNum)} - {result.prevStage} = <strong>{formatEGP(result.inputNum - result.prevStage)} جنيه</strong>.
                    </div>
                  )}

                  <div className="step-item p-2 rounded bg-tertiary">
                    📌 باقي الرسم النسبي ({result.percentage}%): {formatEGP(result.inputNum - result.prevStage)} × {result.percentage} / 100 = <strong>{formatEGP(result.extraPersent)} جنيه</strong>.
                  </div>

                  <div className="step-item p-2 rounded bg-tertiary font-bold text-gold">
                    📌 إجمالي الرسم النسبي = {result.inputNum > 250 ? `${result.prevPersent} + ${result.extraPersent} = ` : ''}{formatEGP(result.persent)} جنيه.
                  </div>

                  <div className="step-item p-2 rounded bg-tertiary">
                    📌 تم سداد رسم نسبي مستحق عند رفع الدعوى بمبلغ <strong>{formatEGP(result.persentGiven)} جنيه</strong>.
                  </div>

                  <div className="step-item p-2 rounded bg-tertiary font-bold text-gold">
                    📌 بخصم المسدد عند رفع الدعوى، يصبح صافي الرسم النسبي: {formatEGP(result.persent)} - {formatEGP(result.persentGiven)} = <strong>{formatEGP(result.netPersent)} جنيه</strong>.
                  </div>

                  <div className="step-item p-2 rounded bg-tertiary font-bold text-purple">
                    📌 صافي رسم الصندوق (50% من النسبي) = {formatEGP(result.box)} - {formatEGP(result.boxGiven)} = <strong>{formatEGP(result.netBox)} جنيه</strong>.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-card empty-calc-state p-12 text-center">
          <Info size={44} className="text-muted mb-3 mx-auto" />
          <h3 className="text-base font-bold text-secondary mb-1">أدخل قيمة المطالبة بالأعلى</h3>
          <p className="text-xs text-muted">سيتم حساب الرسم النسبي وصندوق الخدمات تلقائياً وعرض التفاصيل الفورية</p>
        </div>
      )}
    </div>
  );
}
