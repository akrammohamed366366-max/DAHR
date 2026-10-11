import React, { createContext, useContext, useState, useEffect } from 'react';
import { ContactSettings, BrandingSettings } from '../types/backend';
import {
  settingsApi,
  DEFAULT_BRANDING,
  DEFAULT_CONTACT,
} from '../api/settingsApi';
import { BRAND_NAME } from '../i18n/config';

export interface SocialChannelItem {
  id: string;
  labelEn: string;
  labelAr: string;
  url: string;
  type: 'facebook' | 'facebookGroup' | 'instagram' | 'whatsapp' | 'whatsappGroup' | 'telegramChannel' | 'telegramGroup';
}

interface SettingsContextValue {
  contactSettings: ContactSettings;
  brandingSettings: BrandingSettings;
  loading: boolean;
  saveContactSettings: (settings: ContactSettings) => Promise<void>;
  saveBrandingSettings: (settings: BrandingSettings) => Promise<void>;
  uploadLogo: (file: File) => Promise<string>;
  getSiteName: (locale: 'en' | 'ar') => string;
  getActiveSocialChannels: () => SocialChannelItem[];
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function formatSocialUrl(key: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  switch (key) {
    case 'facebookPage':
      return `https://facebook.com/${trimmed.replace(/^\/+/, '')}`;
    case 'facebookGroup':
      return trimmed.includes('groups/')
        ? `https://facebook.com/${trimmed.replace(/^\/+/, '')}`
        : `https://facebook.com/groups/${trimmed.replace(/^\/+/, '')}`;
    case 'instagram':
      return `https://instagram.com/${trimmed.replace(/^@/, '').replace(/^\/+/, '')}`;
    case 'whatsappNumber': {
      const cleanDigits = trimmed.replace(/\D/g, '');
      return `https://wa.me/${cleanDigits}`;
    }
    case 'whatsappGroup':
      return trimmed.includes('chat.whatsapp.com')
        ? `https://${trimmed.replace(/^https?:\/\//, '')}`
        : `https://chat.whatsapp.com/${trimmed.replace(/^\/+/, '')}`;
    case 'telegramChannel':
    case 'telegramGroup':
      return `https://t.me/${trimmed.replace(/^@/, '').replace(/^\/+/, '')}`;
    default:
      return `https://${trimmed}`;
  }
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contactSettings, setContactSettings] = useState<ContactSettings>(DEFAULT_CONTACT);
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let contactLoaded = false;
    let brandingLoaded = false;

    const checkDone = () => {
      if (contactLoaded && brandingLoaded && isMounted) {
        setLoading(false);
      }
    };

    // Real-time listener for contact settings
    const unsubContact = settingsApi.subscribeContact(
      (contact) => {
        if (isMounted) {
          setContactSettings(contact);
          contactLoaded = true;
          checkDone();
        }
      },
      (err) => {
        console.warn('Contact settings real-time sync notice:', err);
        contactLoaded = true;
        checkDone();
      }
    );

    // Real-time listener for branding settings
    const unsubBranding = settingsApi.subscribeBranding(
      (branding) => {
        if (isMounted) {
          setBrandingSettings(branding);
          brandingLoaded = true;
          checkDone();
        }
      },
      (err) => {
        console.warn('Branding settings real-time sync notice:', err);
        brandingLoaded = true;
        checkDone();
      }
    );

    return () => {
      isMounted = false;
      unsubContact();
      unsubBranding();
    };
  }, []);

  const saveContactSettings = async (newSettings: ContactSettings) => {
    await settingsApi.saveContactSettings(newSettings);
    setContactSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const saveBrandingSettings = async (newSettings: BrandingSettings) => {
    await settingsApi.saveBrandingSettings(newSettings);
    setBrandingSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const uploadLogo = async (file: File): Promise<string> => {
    return await settingsApi.uploadLogo(file);
  };

  const getSiteName = (locale: 'en' | 'ar'): string => {
    const custom = brandingSettings.siteName?.[locale]?.trim();
    return custom || BRAND_NAME;
  };

  const getActiveSocialChannels = (): SocialChannelItem[] => {
    const list: SocialChannelItem[] = [];

    if (contactSettings.facebookPage?.trim()) {
      list.push({
        id: 'facebookPage',
        labelEn: 'Facebook Page',
        labelAr: 'صفحة فيسبوك',
        url: formatSocialUrl('facebookPage', contactSettings.facebookPage),
        type: 'facebook',
      });
    }

    if (contactSettings.facebookGroup?.trim()) {
      list.push({
        id: 'facebookGroup',
        labelEn: 'Facebook Community',
        labelAr: 'مجموعة فيسبوك',
        url: formatSocialUrl('facebookGroup', contactSettings.facebookGroup),
        type: 'facebookGroup',
      });
    }

    if (contactSettings.instagram?.trim()) {
      list.push({
        id: 'instagram',
        labelEn: 'Instagram',
        labelAr: 'إنستغرام',
        url: formatSocialUrl('instagram', contactSettings.instagram),
        type: 'instagram',
      });
    }

    if (contactSettings.whatsappNumber?.trim()) {
      list.push({
        id: 'whatsappNumber',
        labelEn: 'WhatsApp Direct',
        labelAr: 'واتساب مباشر',
        url: formatSocialUrl('whatsappNumber', contactSettings.whatsappNumber),
        type: 'whatsapp',
      });
    }

    if (contactSettings.whatsappGroup?.trim()) {
      list.push({
        id: 'whatsappGroup',
        labelEn: 'WhatsApp Circle',
        labelAr: 'مجموعة واتساب',
        url: formatSocialUrl('whatsappGroup', contactSettings.whatsappGroup),
        type: 'whatsappGroup',
      });
    }

    if (contactSettings.telegramChannel?.trim()) {
      list.push({
        id: 'telegramChannel',
        labelEn: 'Telegram Channel',
        labelAr: 'قناة تيليجرام',
        url: formatSocialUrl('telegramChannel', contactSettings.telegramChannel),
        type: 'telegramChannel',
      });
    }

    if (contactSettings.telegramGroup?.trim()) {
      list.push({
        id: 'telegramGroup',
        labelEn: 'Telegram Community',
        labelAr: 'مجموعة تيليجرام',
        url: formatSocialUrl('telegramGroup', contactSettings.telegramGroup),
        type: 'telegramGroup',
      });
    }

    return list;
  };

  return (
    <SettingsContext.Provider
      value={{
        contactSettings,
        brandingSettings,
        loading,
        saveContactSettings,
        saveBrandingSettings,
        uploadLogo,
        getSiteName,
        getActiveSocialChannels,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextValue => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
