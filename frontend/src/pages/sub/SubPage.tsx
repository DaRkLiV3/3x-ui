import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AndroidFilled,
  AppleFilled,
  CalendarOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  CrownFilled,
  FolderOpenOutlined,
  LineChartOutlined,
  LinkOutlined,
  MoonFilled,
  PieChartOutlined,
  QrcodeOutlined,
  SendOutlined,
  ShareAltOutlined,
  ThunderboltFilled,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { Dropdown, Modal, QRCode, message } from 'antd';
import type { MenuProps } from 'antd/es/menu';

import { ClipboardManager } from '@/utils';

import './SubPage.css';

const subData = window.__SUB_PAGE_DATA__ || {};

const sId = subData.sId || '';
const enabled = !!subData.enabled;

const download = subData.download || '0 B';
const upload = subData.upload || '0 B';
const total = subData.total || '∞';
const used = subData.used || '0 B';
const remained = subData.remained || '';

const totalByte = Number(subData.totalByte || 0);
const downloadByte = Number(subData.downloadByte || 0);
const uploadByte = Number(subData.uploadByte || 0);
const usedByte = Number(subData.usedByte || downloadByte + uploadByte || 0);

const expireMs = Number(subData.expire || 0) * 1000;
const lastOnlineMs = Number(subData.lastOnline || 0);

const subUrl = subData.subUrl || '';
const subJsonUrl = subData.subJsonUrl || '';
const subClashUrl = subData.subClashUrl || '';
const subTitle = subData.subTitle || '';
const links: string[] = Array.isArray(subData.links) ? subData.links : [];
const clientEmail =
  subData.email ||
  subData.clientEmail ||
  subData.remark ||
  subData.name ||
  subTitle ||
  sId ||
  'Client';
const telegramUsername = 'YourTelegramID';
const brandName = 'LunexV2';

function formatDate(ms: number): string {
  if (!ms || ms <= 0) return '--';

  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(new Date(ms));
  } catch {
    return '--';
  }
}

function getMainLink(): string {
  if (links.length > 0) return links[0];
  if (subUrl) return subUrl;
  if (subJsonUrl) return subJsonUrl;
  if (subClashUrl) return subClashUrl;
  return '';
}

function getStatusText(): string {
  if (!enabled) return 'Disabled';
  if (totalByte <= 0 && expireMs === 0) return 'Unlimited';
  return 'Active';
}

function getUsagePercent(): number {
  if (!totalByte || totalByte <= 0) return 0;

  const percent = Math.round((usedByte / totalByte) * 100);
  return Math.min(Math.max(percent, 0), 100);
}

function shortText(value: string, fallback = '--'): string {
  if (!value) return fallback;
  return value;
}

export default function SubPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [qrOpen, setQrOpen] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [qrTitle, setQrTitle] = useState('Subscription QR Code');
  const [isDark, setIsDark] = useState(true);

  const mainLink = useMemo(() => getMainLink(), []);
  const configLinks = useMemo(() => {
  if (links.length > 0) return links;

  const fallbackLinks = [subUrl, subJsonUrl, subClashUrl].filter(Boolean);

  return fallbackLinks;
}, []);
  const usagePercent = useMemo(() => getUsagePercent(), []);
  const remainingText = useMemo(() => {
    if (totalByte <= 0) return '∞';
    return remained || '--';
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('lunex-light', !isDark);
    document.documentElement.classList.toggle('lunex-dark', isDark);
  }, [isDark]);

  const copy = useCallback(
    async (value: string, label = 'Copied') => {
      if (!value) {
        messageApi.warning('No link available');
        return;
      }

      const ok = await ClipboardManager.copyText(value);

      if (ok) {
        messageApi.success(label);
      } else {
        messageApi.error('Copy failed');
      }
    },
    [messageApi],
  );
    const openQr = useCallback(
    (value: string, title = 'Subscription QR Code') => {
      if (!value) {
        messageApi.warning('No link available');
        return;
      }

      setQrValue(value);
      setQrTitle(title);
      setQrOpen(true);
    },
    [messageApi],
  );

  const openUrl = useCallback((url: string) => {
    if (!url) return;
    window.location.href = url;
  }, []);

  const androidItems: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'v2rayng',
        label: 'V2RayNG',
        onClick: () => openUrl(`v2rayng://install-config?url=${encodeURIComponent(subUrl)}`),
      },
      {
        key: 'hiddify',
        label: 'Hiddify',
        onClick: () => openUrl(`hiddify://import/${encodeURIComponent(subUrl)}`),
      },
      {
        key: 'v2box',
        label: 'V2Box',
        onClick: () =>
          openUrl(
            `v2box://install-sub?url=${encodeURIComponent(subUrl)}&name=${encodeURIComponent(
              subTitle || sId || 'Subscription',
            )}`,
          ),
      },
      {
        key: 'copy',
        label: 'Copy subscription link',
        onClick: () => copy(subUrl || mainLink, 'Subscription copied'),
      },
    ],
    [copy, mainLink, openUrl],
  );

  const iosItems: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'shadowrocket',
        label: 'Shadowrocket',
        onClick: () => {
          const rawUrl = subUrl.includes('?') ? `${subUrl}&flag=shadowrocket` : `${subUrl}?flag=shadowrocket`;
          const base64Url = btoa(rawUrl).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
          const remark = encodeURIComponent(subTitle || sId || 'Subscription');
          openUrl(`shadowrocket://add/sub/${base64Url}?remark=${remark}`);
        },
      },
      {
        key: 'streisand',
        label: 'Streisand',
        onClick: () => openUrl(`streisand://import/${encodeURIComponent(subUrl)}`),
      },
      {
        key: 'v2box',
        label: 'V2Box',
        onClick: () =>
          openUrl(
            `v2box://install-sub?url=${encodeURIComponent(subUrl)}&name=${encodeURIComponent(
              subTitle || sId || 'Subscription',
            )}`,
          ),
      },
      {
        key: 'copy',
        label: 'Copy subscription link',
        onClick: () => copy(subUrl || mainLink, 'Subscription copied'),
      },
    ],
    [copy, mainLink, openUrl],
  );

  return (
    <main className="lunex-sub-page">
      {contextHolder}

      <div className="lunex-stars" />

      <button className="lunex-theme-btn" type="button" onClick={() => setIsDark((prev) => !prev)}>
        <MoonFilled />
        <span>{isDark ? 'Dark' : 'Light'}</span>
      </button>

      <section className="lunex-hero">
        <div className="lunex-shield-orb">
          <div className="lunex-shield">
            <ThunderboltFilled />
          </div>
        </div>

        <h1>
          Subscription <span>info</span>
        </h1>

        <button className="lunex-id-pill" type="button" onClick={() => copy(sId, 'ID copied')}>
          <LinkOutlined />
          <span>ID: {shortText(sId)}</span>
        </button>
      </section>

      <section className="lunex-layout">
        <div className="lunex-card lunex-plan-card">
          <div className="lunex-section-title">
            <CrownFilled />
            <span>PLAN</span>
          </div>

          <div className="lunex-plan-box">
            <div className="lunex-glow-dot" />
            <div>
              <h2>{getStatusText()}</h2>
              <p>Subscription Plan</p>
            </div>
            <button type="button" onClick={() => copy(sId, 'Subscription ID copied')}>
              {shortText(sId)}
            </button>
          </div>

          <div className="lunex-section-title lunex-usage-title">
            <LineChartOutlined />
            <span>USAGE</span>
          </div>

          <div className="lunex-stats-grid">
            <div className="lunex-stat-box">
              <DownOutlined className="lunex-stat-icon" />
              <div>
                <span>DOWNLOADED</span>
                <strong>{download}</strong>
              </div>
              <i />
            </div>

            <div className="lunex-stat-box">
              <UpOutlined className="lunex-stat-icon" />
              <div>
                <span>UPLOADED</span>
                <strong>{upload}</strong>
              </div>
              <i />
            </div>

            <div className="lunex-stat-box">
              <PieChartOutlined className="lunex-stat-icon" />
              <div>
                <span>TOTAL USAGE</span>
                <strong>{used}</strong>
              </div>
            </div>

            <div className="lunex-stat-box">
              <FolderOpenOutlined className="lunex-stat-icon" />
              <div>
                <span>TOTAL QUOTA</span>
                <strong>{total}</strong>
              </div>
            </div>

            <div className="lunex-stat-box">
              <ClockCircleOutlined className="lunex-stat-icon" />
              <div>
                <span>LAST ONLINE</span>
                <strong>{formatDate(lastOnlineMs)}</strong>
              </div>
            </div>

            <div className="lunex-stat-box">
              <CalendarOutlined className="lunex-stat-icon" />
              <div>
                <span>EXPIRY</span>
                <strong>{expireMs === 0 ? '--' : formatDate(expireMs)}</strong>
              </div>
            </div>
          </div>

          <div className="lunex-progress-panel">
            <div
              className="lunex-ring"
              style={{
                background: `conic-gradient(#9b5cff ${usagePercent * 3.6}deg, #4d4b67 0deg)`,
              }}
            >
              <div>{usagePercent}%</div>
            </div>

            <div className="lunex-progress-info">
              <h3>
                <span>{used}</span> / {total} Used
              </h3>
              <div className="lunex-bar">
                <span style={{ width: `${usagePercent}%` }} />
              </div>
              <div className="lunex-legend">
                <span>
                  <b className="used" /> Used
                </span>
                <span>
                  <b className="remaining" /> Remaining
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lunex-right">
          <div className="lunex-card lunex-link-card">
            <div className="lunex-section-title">
              <ShareAltOutlined />
              <span>SUBSCRIPTION ID</span>
            </div>

            <div className="lunex-link-top">
              <strong>{clientEmail}</strong>
              <button type="button" onClick={() => copy(subUrl || mainLink, 'Subscription copied')}>
                <CopyOutlined />
                Copy Sub
              </button>
            </div>

            <div className="lunex-config-list">
              {configLinks.length > 0 ? (
                configLinks.map((link, index) => (
                  <div className="lunex-config-item" key={`${link}-${index}`}>
                    <div className="lunex-config-head">
                      <strong>Config #{index + 1}</strong>

                      <div>
                        <button type="button" onClick={() => copy(link, `Config #${index + 1} copied`)}>
                          <CopyOutlined />
                          Copy
                        </button>

                        <button type="button" onClick={() => openQr(link, `Config #${index + 1} QR Code`)}>
                          <QrcodeOutlined />
                          QR
                        </button>
                      </div>
                    </div>

                    <pre className="lunex-link-box" onClick={() => copy(link, `Config #${index + 1} copied`)}>
                      {shortText(link)}
                    </pre>
                  </div>
                ))
              ) : (
                <pre className="lunex-link-box">No config available</pre>
              )}
            </div>
          </div>

          <div className="lunex-card lunex-connect-card">
            <div className="lunex-section-title">
              <ShareAltOutlined />
              <span>CONNECT</span>
            </div>

            <div className="lunex-connect-grid">
              <Dropdown menu={{ items: androidItems }} trigger={['click']} placement="bottom">
                <button type="button" className="lunex-os-btn">
                  <AndroidFilled className="android" />
                  <strong>Android</strong>
                  <span>Tap to Connect</span>
                </button>
              </Dropdown>

              <Dropdown menu={{ items: iosItems }} trigger={['click']} placement="bottom">
                <button type="button" className="lunex-os-btn">
                  <AppleFilled className="apple" />
                  <strong>iOS</strong>
                  <span>Tap to Connect</span>
                </button>
              </Dropdown>
            </div>
          </div>
        </div>
      </section>
      
      <section className="lunex-wide-card">
        <div className="lunex-wide-left">
          <div className="lunex-wide-icon">
            <QrcodeOutlined />
          </div>
          <div>
            <h3>Scan QR Code</h3>
            <p>Scan this QR Code in your client</p>
          </div>
        </div>

        <button type="button" onClick={() => openQr(subUrl || mainLink, 'Subscription QR Code')}>
          <QrcodeOutlined />
          Show QR Code
        </button>
      </section>

      <section className="lunex-wide-card lunex-telegram-card">
        <div className="lunex-wide-left">
          <div className="lunex-wide-icon telegram">
            <SendOutlined />
          </div>
          <div>
            <h3>Contact on Telegram</h3>
            <p>Need help? Contact LUNEX</p>
          </div>
        </div>

        <button type="button" onClick={() => openUrl(`https://t.me/lunexsup`)}>
          <SendOutlined />
          Message Me
        </button>
      </section>

      <footer className="lunex-footer">
        <span>Powered by</span>
        <strong>{brandName}</strong>
      </footer>

      <Modal
  title={qrTitle}
  open={qrOpen}
  onCancel={() => setQrOpen(false)}
  footer={null}
  centered
  className="lunex-qr-modal"
>
  <div className="lunex-qr-wrap">
    <QRCode value={qrValue || subUrl || mainLink || sId || 'empty'} size={260} />
    <button type="button" onClick={() => copy(qrValue || subUrl || mainLink, 'QR link copied')}>
      <CopyOutlined />
      Copy Link
    </button>
  </div>
</Modal>
    </main>
  );
}
