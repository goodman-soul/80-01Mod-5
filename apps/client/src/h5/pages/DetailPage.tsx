import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../shared/api';
import type { EquipmentTypeWithStock } from '../../shared/types';

export function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<EquipmentTypeWithStock | null>(null);
  const [alternatives, setAlternatives] = useState<EquipmentTypeWithStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.getEquipmentType(id),
      api.getEquipmentAlternatives(id),
    ])
      .then(([type, alts]) => {
        setData(type);
        setAlternatives(alts);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading || !data) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center', padding: 60 }}>加载中...</div>
      </div>
    );
  }

  const stockAvailable = data.stock.available > 0;
  const stockCleaning = data.stock.cleaning > 0;

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
          <h1 style={{ fontSize: 18, margin: 0 }}>设备详情</h1>
        </div>
      </div>

      <div className="content">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h2 style={{ marginTop: 0, marginBottom: 6, fontSize: 20 }}>{data.name}</h2>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#ff4d4f' }}>
                ¥{data.deposit}
              </div>
              <div style={{ fontSize: 12, color: '#888' }}>押金</div>
            </div>
          </div>
          <div style={{ color: '#666', fontSize: 14, lineHeight: 1.6, marginTop: 8 }}>
            {data.description}
          </div>
          <div style={{ marginTop: 14 }}>
            <span className={`tag ${stockAvailable ? 'tag-green' : stockCleaning ? 'tag-orange' : 'tag-red'}`}>
              {stockAvailable
                ? `在库可借 ${data.stock.available} 台`
                : stockCleaning
                ? `消毒中 ${data.stock.cleaning} 台，预计1-2天可用`
                : '暂无库存'}
            </span>
            {data.stock.borrowed > 0 && (
              <span className="tag tag-blue">已借出 {data.stock.borrowed} 台</span>
            )}
          </div>
        </div>

        {!stockAvailable && alternatives.length > 0 && (
          <div className="card" style={{ background: '#fffbe6' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#d48806' }}>该设备当前在库不足</h4>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 10 }}>
              以下为同类其他可替代型号：
            </div>
            {alternatives.map((a) => (
              <Link
                key={a.id}
                to={`/detail/${a.id}`}
                style={{
                  display: 'block',
                  padding: '10px 0',
                  borderTop: '1px solid #fff1b8',
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{a.name}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{a.description}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="tag tag-green">可借 {a.stock.available}</span>
                    <div style={{ fontSize: 12, color: '#ff4d4f', marginTop: 4 }}>¥{a.deposit}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="card">
          <h4 style={{ marginTop: 0, marginBottom: 10 }}>📋 适配说明（请仔细阅读）</h4>
          <div
            style={{
              fontSize: 14,
              lineHeight: 1.8,
              color: '#444',
              whiteSpace: 'pre-wrap',
              background: '#f6ffed',
              padding: 12,
              borderRadius: 8,
            }}
          >
            {data.adaptation_guide}
          </div>
        </div>

        <div className="card">
          <h4 style={{ marginTop: 0, marginBottom: 10 }}>📦 标准配件</h4>
          <div>
            {data.accessories.map((a) => (
              <span key={a} className="tag tag-gray" style={{ marginBottom: 6 }}>
                {a}
              </span>
            ))}
          </div>
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
          display: 'flex',
          gap: 12,
        }}
      >
        <button
          className="btn-outline"
          style={{ flex: 1 }}
          onClick={() => navigate(-1)}
        >
          返回
        </button>
        <button
          className="btn-primary"
          style={{ flex: 2 }}
          disabled={!stockAvailable && !stockCleaning}
          onClick={() => navigate(`/apply/${id}`)}
        >
          {stockAvailable ? '立即申请借用' : stockCleaning ? '预约排队' : '暂无库存'}
        </button>
      </div>
    </div>
  );
}
