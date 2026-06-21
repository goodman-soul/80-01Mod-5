import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../shared/api';
import type { EquipmentTypeWithStock } from '../../shared/types';
import { EquipmentCategory } from '../../shared/types';

const categoryNames: Record<EquipmentCategory, string> = {
  [EquipmentCategory.WHEELCHAIR]: '轮椅',
  [EquipmentCategory.WALKER]: '助行器',
  [EquipmentCategory.OXYGEN_CONCENTRATOR]: '制氧机',
};

export function CategoryPage() {
  const { category } = useParams<{ category: EquipmentCategory }>();
  const navigate = useNavigate();
  const [list, setList] = useState<EquipmentTypeWithStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    api.getEquipmentTypes(category).then((data) => {
      setList(data);
      setLoading(false);
    });
  }, [category]);

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
          <h1 style={{ fontSize: 18, margin: 0 }}>{categoryNames[category as EquipmentCategory]}</h1>
        </div>
        <div className="subtitle">选择您需要的设备型号</div>
      </div>

      <div className="content">
        {loading && <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>}
        {!loading && list.length === 0 && (
          <div className="empty-state">
            <div className="icon">📦</div>
            该分类下暂无设备
          </div>
        )}
        {list.map((item) => (
          <Link
            key={item.id}
            to={`/detail/${item.id}`}
            className="equipment-item"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="main">
              <div className="name">{item.name}</div>
              <div className="desc">{item.description}</div>
              <div className="deposit">押金 ¥{item.deposit}</div>
            </div>
            <div className="stock-info">
              <div style={{ fontSize: 13, marginBottom: 4 }}>
                <span className="tag tag-green">在库 {item.stock.available}</span>
              </div>
              {item.stock.cleaning > 0 && (
                <div style={{ fontSize: 12, color: '#fa8c16' }}>
                  消毒中 {item.stock.cleaning} 台
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
