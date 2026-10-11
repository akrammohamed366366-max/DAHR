import React from 'react';
import { motion } from 'motion/react';
import { useI18n } from '../../i18n/context';
import { editorialRevealVariants } from '../../utils/motion';

export const BrandPhilosophySection: React.FC = () => {
  const { t } = useI18n();

  return (
    <section
      id="brand-philosophy-section"
      aria-label={t('philosophy.sectionAria')}
      className="w-full max-w-[1520px] mx-auto px-6 sm:px-12 lg:px-20 py-8 sm:py-16"
    >
      <motion.div
        variants={editorialRevealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="relative border-y border-[#E4DED3] py-20 sm:py-28 lg:py-32 bg-[#FAF7F2]/50"
      >
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center px-4 sm:px-8">
          {/* Eyebrow */}
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A98860] mb-6 block">
            {t('philosophy.eyebrow')}
          </span>

          {/* Editorial Headline */}
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C1A17] font-normal leading-[1.25] tracking-tight mb-8">
            {t('philosophy.headline')}
          </h2>

          {/* Whitespace-led Editorial Statement */}
          <div className="flex flex-col gap-6 text-[16px] sm:text-[18px] lg:text-[19px] text-[#554F47] leading-[1.8] font-body font-light max-w-3xl">
            <p>
              {t('philosophy.p1')}
            </p>
            <p className="text-[14px] sm:text-[16px] text-[#7A736A] leading-[1.75]">
              {t('philosophy.p2')}
            </p>
          </div>

          {/* Minimal Brand Core Principles (Typographic, no icons) */}
          <div className="w-full max-w-2xl mt-14 pt-10 border-t border-[#E4DED3]/80 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-start">
            <div className="flex flex-col gap-1.5 items-center sm:items-start">
              <span className="text-[11px] font-mono text-[#A98860] uppercase tracking-wider">
                {t('philosophy.originTitle')}
              </span>
              <span className="font-serif text-[17px] text-[#1C1A17]">
                {t('philosophy.originSubtitle')}
              </span>
              <span className="text-[12px] text-[#7A736A] font-body">
                {t('philosophy.originDesc')}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 items-center sm:items-start">
              <span className="text-[11px] font-mono text-[#A98860] uppercase tracking-wider">
                {t('philosophy.potencyTitle')}
              </span>
              <span className="font-serif text-[17px] text-[#1C1A17]">
                {t('philosophy.potencySubtitle')}
              </span>
              <span className="text-[12px] text-[#7A736A] font-body">
                {t('philosophy.potencyDesc')}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 items-center sm:items-start">
              <span className="text-[11px] font-mono text-[#A98860] uppercase tracking-wider">
                {t('philosophy.timeTitle')}
              </span>
              <span className="font-serif text-[17px] text-[#1C1A17]">
                {t('philosophy.timeSubtitle')}
              </span>
              <span className="text-[12px] text-[#7A736A] font-body">
                {t('philosophy.timeDesc')}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
