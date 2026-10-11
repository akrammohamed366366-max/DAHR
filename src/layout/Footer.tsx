import React from 'react';
import {
  Facebook,
  Instagram,
  MessageCircle,
  MessagesSquare,
  Send,
  Users,
  ExternalLink,
} from 'lucide-react';
import { useI18n } from '../i18n/context';
import { BRAND_NAME } from '../i18n/config';
import { LocaleSwitcher } from '../components/ui/LocaleSwitcher';
import { RouteId } from '../types';
import { useSettings, SocialChannelItem } from '../context/SettingsContext';

interface FooterProps {
  onRouteChange?: (route: RouteId) => void;
}

function renderSocialIcon(type: SocialChannelItem['type']) {
  switch (type) {
    case 'facebook':
      return <Facebook className="w-4 h-4" />;
    case 'facebookGroup':
      return <Users className="w-4 h-4" />;
    case 'instagram':
      return <Instagram className="w-4 h-4" />;
    case 'whatsapp':
      return <MessageCircle className="w-4 h-4" />;
    case 'whatsappGroup':
      return <MessagesSquare className="w-4 h-4" />;
    case 'telegramChannel':
    case 'telegramGroup':
      return <Send className="w-4 h-4" />;
    default:
      return <ExternalLink className="w-4 h-4" />;
  }
}

export const Footer: React.FC<FooterProps> = ({ onRouteChange }) => {
  const { locale, direction, t } = useI18n();
  const { getSiteName, getActiveSocialChannels } = useSettings();

  const currentSiteName = getSiteName(locale);
  const activeSocials = getActiveSocialChannels();

  const handleNavClick = (route: RouteId) => {
    if (onRouteChange) {
      onRouteChange(route);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer
      id="app-footer"
      role="contentinfo"
      aria-label={`${currentSiteName} - ${t('footer.brandEssence')}`}
      className="border-t border-[#E4DED3] bg-[#FAF7F2] text-[#7A736A] pt-12 pb-8 px-4 sm:px-8 lg:px-16 mt-auto"
    >
      <div className="max-w-[1520px] mx-auto flex flex-col gap-10">
        {/* Top Tier: DAHR Wordmark & Quiet Brand Essence */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#E4DED3]">
          <div className="flex flex-col gap-2 max-w-xl text-start">
            <span
              id="footer-brand-wordmark"
              className="font-serif text-2xl sm:text-3xl tracking-[0.25em] font-light text-[#1C1A17]"
            >
              {currentSiteName}
            </span>
            <p className="text-[13px] text-[#7A736A] leading-relaxed font-body">
              {t('footer.brandEssence')}
            </p>
          </div>

          {/* Discreet Concierge Contact */}
          <div className="flex flex-col items-start md:items-end gap-1.5 font-mono text-[11px] text-start md:text-end">
            <span className="text-[#1C1A17] uppercase tracking-wider font-semibold">
              {t('footer.supportHeading')}
            </span>
            <a
              href="mailto:concierge@dahr.luxury"
              className="text-[#A98860] hover:text-[#1C1A17] transition-colors focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:outline-none"
            >
              concierge@dahr.luxury
            </a>
            <span className="text-[#7A736A] text-[10px]">
              {t('home.atelierLocation')}
            </span>
          </div>
        </div>

        {/* Middle Tier: Restrained Horizontal Primary Nav & Socials */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 font-body text-[12px]">
          {/* Primary Nav Links */}
          <nav aria-label={locale === 'ar' ? 'التنقل الرئيسي للتذييل' : 'Footer Primary Navigation'}>
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 uppercase tracking-[0.15em] [dir=rtl]:tracking-normal [dir=rtl]:normal-case font-medium text-[#1C1A17]">
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('home')}
                  className="hover:text-[#A98860] transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-[#A98860]"
                >
                  {t('nav.home')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('shop')}
                  className="hover:text-[#A98860] transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-[#A98860]"
                >
                  {t('nav.shop')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('collections')}
                  className="hover:text-[#A98860] transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-[#A98860]"
                >
                  {t('nav.collections')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('about')}
                  className="hover:text-[#A98860] transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-[#A98860]"
                >
                  {t('nav.about')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('journal')}
                  className="hover:text-[#A98860] transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-[#A98860]"
                >
                  {t('nav.journal')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('contact')}
                  className="hover:text-[#A98860] transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-[#A98860]"
                >
                  {t('nav.contact')}
                </button>
              </li>
            </ul>
          </nav>

          {/* Social Links — Render dynamic channels from settings/contact only */}
          {activeSocials.length > 0 && (
            <div id="footer-social-channels" className="flex items-center gap-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#1C1A17] font-medium hidden sm:inline">
                {t('footer.socialHeading')}:
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {activeSocials.map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={locale === 'ar' ? social.labelAr : social.labelEn}
                    title={locale === 'ar' ? social.labelAr : social.labelEn}
                    className="p-1.5 text-[#7A736A] hover:text-[#A98860] hover:bg-[#F5F1EA] rounded-[2px] transition-colors focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:outline-none"
                  >
                    {renderSocialIcon(social.type)}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Tier: Legal Links, Language Switcher & Copyright */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-6 border-t border-[#E4DED3] text-[11px] font-mono text-[#7A736A]">
          {/* Legal Links */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <button
              type="button"
              id="footer-link-privacy"
              onClick={() => handleNavClick('privacy')}
              className="hover:text-[#1C1A17] transition-colors cursor-pointer text-start"
            >
              {t('footer.privacyPolicy')}
            </button>
            <span className="opacity-30">•</span>
            <button
              type="button"
              id="footer-link-terms"
              onClick={() => handleNavClick('terms')}
              className="hover:text-[#1C1A17] transition-colors cursor-pointer text-start"
            >
              {t('footer.termsOfService')}
            </button>
            <span className="opacity-30">•</span>
            <button
              type="button"
              id="footer-link-shipping"
              onClick={() => handleNavClick('shipping-returns')}
              className="hover:text-[#1C1A17] transition-colors cursor-pointer text-start"
            >
              {t('footer.shippingReturns')}
            </button>
          </div>

          {/* Center / Right: Footer Language Switcher + Copyright */}
          <div className="flex items-center gap-4 flex-wrap">
            <LocaleSwitcher id="footer-locale-switcher" variant="minimal" size="sm" />
            <span className="opacity-30 hidden sm:inline">|</span>
            <span id="footer-copyright-text">
              © {new Date().getFullYear()} {currentSiteName}. {t('footer.allRightsReserved')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
