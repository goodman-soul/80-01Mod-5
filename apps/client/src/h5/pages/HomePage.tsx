import { Link, useNavigate } from 'react-router-dom';
import { EquipmentCategory } from '../../shared/types';

const categories = [
  {
    key: EquipmentCategory.WHEELCHAIR,
    name: '轮椅',
    desc: '手动/电动轮椅，行动不便老人使用',
    icon: '🦽',
  },
  {
    key: EquipmentCategory.WALKER,
    name: '助行器',
    desc: '助行杖、助行架，辅助行走康复',
    icon: '🚶',
  },
  {
    key: EquipmentCategory.OXYGEN_CONCENTRATOR,
    name: '制氧机',
    desc: '家用氧疗设备，呼吸康复辅助',
    icon: '💨',
  },
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="page-header">
        <h1>康复器械借用</h1>
        <div className="subtitle">为长者提供便捷的康复设备租赁服务</div>
      </div>

      <div className="content">
        <h3 style={{ marginTop: 0, marginBottom: 14, fontSize: 16 }}>选择设备类型</h3>
        {categories.map((c) => (
          <Link
            key={c.key}
            to={`/category/${c.key}`}
            className="category-card"
          >
            <div className="icon">{c.icon}</div>
            <div className="info">
              <h3>{c.name}</h3>
              <p>{c.desc}</p>
            </div>
            <div style={{ fontSize: 20, color: '#1677ff' }}>›</div>
          </Link>
        ))}

        <div className="card" style={{ marginTop: 24 }}>
          <h4 style={{ marginTop: 0, marginBottom: 10 }}>借用须知</h4>
          <div style={{ fontSize: 13, color: '#666', lineHeight: 1.8 }}>
            <div>1. 借用需缴纳押金，归还时设备完好将全额退还</div>
            <div>2. 请认真阅读适配说明，确保设备适合使用</div>
            <div>3. 请在预计归还日前归还，如需延期请联系管家</div>
            <div>4. 使用过程中如有损坏请及时告知工作人员</div>
          </div>
        </div>
      </div>

      <div className="bottom-nav">
        <div className="bottom-nav-item active">
          <span className="icon">🏠</span>
          <span>首页</span>
        </div>
        <div className="bottom-nav-item" onClick={() => navigate('/my')}>
          <span className="icon">👤</span>
          <span>我的申请</span>
        </div>
      </div>
    </div>
  );
}
