import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Toast, Dialog } from 'antd-mobile';
import { api } from '../../shared/api';
import type { EquipmentTypeWithStock } from '../../shared/types';

export function ApplyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<EquipmentTypeWithStock | null>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    elderly_id: '',
    deposit_paid: false,
    expected_return_date: '',
    adaptation_notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.getEquipmentType(id).then(setData);
  }, [id]);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      Toast.show({ content: '请输入姓名', icon: 'fail' });
      return;
    }
    if (!/^1\d{10}$/.test(form.phone.trim())) {
      Toast.show({ content: '请输入正确的手机号', icon: 'fail' });
      return;
    }
    if (!form.expected_return_date) {
      Toast.show({ content: '请选择预计归还日期', icon: 'fail' });
      return;
    }
    if (!form.deposit_paid) {
      Toast.show({ content: '请确认已缴纳押金', icon: 'fail' });
      return;
    }

    try {
      setSubmitting(true);
      await api.createBorrowRequest({
        elderly_id: form.elderly_id || `temp-${Date.now()}`,
        elderly_name: form.name.trim(),
        elderly_phone: form.phone.trim(),
        type_id: id!,
        deposit_paid: form.deposit_paid,
        expected_return_date: form.expected_return_date,
        adaptation_notes: form.adaptation_notes.trim() || undefined,
      });

      Dialog.show({
        title: '申请已提交',
        content: '您的借用申请已成功提交，请等待管家审核。审核通过后，将尽快安排发货。',
        closeOnAction: true,
        actions: [
          {
            key: 'my',
            text: '查看我的申请',
            onClick: () => navigate('/my'),
          },
          {
            key: 'home',
            text: '返回首页',
            style: 'primary',
            onClick: () => navigate('/'),
          },
        ],
      });
    } catch (e: unknown) {
      Toast.show({ content: (e as Error).message, icon: 'fail' });
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <span
            style={{ fontSize: 22, marginRight: 12, cursor: 'pointer' }}
            onClick={() => navigate(-1)}
          >
            ‹
          </span>
          <h1 style={{ fontSize: 18, margin: 0 }}>申请借用</h1>
        </div>
        <div className="subtitle">请填写申请信息</div>
      </div>

      <div className="content">
        {data && (
          <div className="card">
            <div className="info-row">
              <span className="label">设备名称</span>
              <span className="value">{data.name}</span>
            </div>
            <div className="info-row">
              <span className="label">押金金额</span>
              <span className="value" style={{ color: '#ff4d4f' }}>¥{data.deposit}</span>
            </div>
            <div className="info-row">
              <span className="label">当前库存</span>
              <span className="value">
                <span className="tag tag-green">在库 {data.stock.available}</span>
                {data.stock.cleaning > 0 && (
                  <span className="tag tag-orange">消毒中 {data.stock.cleaning}</span>
                )}
              </span>
            </div>
          </div>
        )}

        <div className="card">
          <h4 className="section-title">申请人信息</h4>

          <div className="input-wrap">
            <div className="form-label">
              <span className="required">*</span>老人姓名
            </div>
            <input
              type="text"
              placeholder="请输入老人姓名"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div className="input-wrap">
            <div className="form-label">
              <span className="required">*</span>联系电话
            </div>
            <input
              type="tel"
              placeholder="请输入手机号"
              maxLength={11}
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })
              }
              style={inputStyle}
            />
          </div>

          <div className="input-wrap">
            <div className="form-label">老人编号（选填）</div>
            <input
              type="text"
              placeholder="如有内部编号请填写"
              value={form.elderly_id}
              onChange={(e) => setForm({ ...form, elderly_id: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>

        <div className="card">
          <h4 className="section-title">借用信息</h4>

          <div className="input-wrap">
            <div className="form-label">
              <span className="required">*</span>预计归还日期
            </div>
            <input
              type="date"
              min={today}
              value={form.expected_return_date}
              onChange={(e) =>
                setForm({ ...form, expected_return_date: e.target.value })
              }
              style={inputStyle}
            />
          </div>

          <div className="input-wrap">
            <div className="form-label">适用情况（选填）</div>
            <textarea
              placeholder="请描述使用需求、身体状况等适配信息..."
              value={form.adaptation_notes}
              onChange={(e) =>
                setForm({ ...form, adaptation_notes: e.target.value })
              }
              rows={3}
              style={{ ...inputStyle, height: 90, resize: 'none', paddingTop: 10 }}
            />
          </div>

          <div
            style={{
              background: '#f0f9ff',
              padding: 12,
              borderRadius: 8,
              marginBottom: 8,
            }}
          >
            <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
              ⚠️ 请确认您已阅读并了解以下内容：
            </div>
            <div style={{ fontSize: 12, color: '#888', lineHeight: 1.6 }}>
              {data?.adaptation_guide}
            </div>
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              padding: '8px 0',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={form.deposit_paid}
              onChange={(e) => setForm({ ...form, deposit_paid: e.target.checked })}
              style={{ marginTop: 3 }}
            />
            <span style={{ fontSize: 14, color: '#333', lineHeight: 1.5 }}>
              我已确认缴纳押金 <strong style={{ color: '#ff4d4f' }}>¥{data?.deposit}</strong>，并承诺按期完好归还设备
            </span>
          </label>
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          padding: '12px 16px',
          paddingBottom: `calc(12px + env(safe-area-inset-bottom))`,
          borderTop: '1px solid #f0f0f0',
        }}
      >
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '提交中...' : '提交申请'}
        </button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  fontSize: 15,
  outline: 'none',
  background: '#fafafa',
  fontFamily: 'inherit',
};
