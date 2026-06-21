import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../shared/api';
import type { BorrowRequestDetail } from '../../shared/types';
import { BORROW_STATUS_LABEL } from '../../shared/types';

export function MyPage() {
  const navigate = useNavigate();
  const [list, setList] = useState<BorrowRequestDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBorrowRequests().then((data) => {
      setList(data);
      setLoading(false);
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'tag-orange';
      case 'approved':
        return 'tag-blue';
      case 'rejected':
        return 'tag-red';
      case 'shipped':
        return 'tag-green';
      case 'returned':
        return 'tag-orange';
      case 'completed':
        return 'tag-green';
      default:
        return 'tag-gray';
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <span
            style={{ fontSize: 22, marginRight: 12, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            ‹
          </span>
          <h1 style={{ fontSize: 18, margin: 0 }}>我的申请</h1>
        </div>
        <div className="subtitle">查看借用申请进度</div>
      </div>

      <div className="content">
        {loading && (
          <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
        )}
        {!loading && list.length === 0 && (
          <div className="empty-state">
            <div className="icon">📋</div>
            暂无申请记录
            <div style={{ marginTop: 16 }}>
              <button
                className="btn-primary"
                style={{ width: 'auto', padding: '10px 24px' }}
                onClick={() => navigate('/')}
              >
                去申请
              </button>
            </div>
          </div>
        )}
        {list.map((item) => (
          <div key={item.id} className="card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 10,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {item.type?.name}
              </div>
              <span className={`tag ${getStatusColor(item.status)}`}>
                {BORROW_STATUS_LABEL[item.status]}
              </span>
            </div>

            <div className="info-row">
              <span className="label">申请人</span>
              <span className="value">
                {item.elderly_name} ({item.elderly_phone})
              </span>
            </div>
            <div className="info-row">
              <span className="label">押金</span>
              <span className="value">
                {item.deposit_paid ? (
                  <span style={{ color: '#52c41a' }}>已缴纳 ¥{item.type?.deposit}</span>
                ) : (
                  <span style={{ color: '#ff4d4f' }}>未缴纳</span>
                )}
              </span>
            </div>
            <div className="info-row">
              <span className="label">预计归还日</span>
              <span className="value">{item.expected_return_date}</span>
            </div>
            <div className="info-row">
              <span className="label">申请时间</span>
              <span className="value">
                {new Date(item.created_at).toLocaleDateString('zh-CN')}
              </span>
            </div>

            {item.adaptation_notes && (
              <div
                style={{
                  marginTop: 10,
                  padding: 10,
                  background: '#f6ffed',
                  borderRadius: 6,
                  fontSize: 13,
                  color: '#555',
                }}
              >
                <span style={{ fontWeight: 500 }}>适配备注：</span>
                {item.adaptation_notes}
              </div>
            )}

            {item.status === 'rejected' && item.damage_notes && (
              <div
                style={{
                  marginTop: 10,
                  padding: 10,
                  background: '#fff1f0',
                  borderRadius: 6,
                  fontSize: 13,
                  color: '#ff4d4f',
                }}
              >
                <span style={{ fontWeight: 500 }}>驳回原因：</span>
                {item.damage_notes}
              </div>
            )}

            {item.status === 'shipped' && (
              <div
                style={{
                  marginTop: 10,
                  padding: 10,
                  background: '#e6f4ff',
                  borderRadius: 6,
                  fontSize: 13,
                  color: '#1677ff',
                }}
              >
                📦 设备已由 {item.shipped_by} 于{' '}
                {item.shipped_at &&
                  new Date(item.shipped_at).toLocaleDateString('zh-CN')}{' '}
                发出，请注意查收
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bottom-nav">
        <div
          className="bottom-nav-item"
          onClick={() => navigate('/')}
        >
          <span className="icon">🏠</span>
          <span>首页</span>
        </div>
        <div className="bottom-nav-item active">
          <span className="icon">👤</span>
          <span>我的申请</span>
        </div>
      </div>
    </div>
  );
}
