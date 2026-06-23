import Image from 'next/image';
import styles from './ScreenshotShowcase.module.css';

const SHOTS = [
  {
    id: 'fight',
    src: '/screenshots/combat.png',
    alt: 'Combat screen showing a victory against a Crypt Revenant',
    caption: 'Fight through the dungeon.',
  },
  {
    id: 'loot',
    src: '/screenshots/loot-reveal.png',
    alt: 'Legendary item reveal for Hollow Signet of Embers',
    caption: 'Reveal what dropped.',
  },
  {
    id: 'build',
    src: '/screenshots/profile.png',
    alt: 'Character profile with equipped gear and stats',
    caption: 'Build your loadout.',
  },
] as const;

export function ScreenshotShowcase() {
  return (
    <div className={styles.grid}>
      {SHOTS.map((shot) => (
        <figure key={shot.id} id={shot.id} className={styles.item}>
          <div className={styles.frame}>
            <Image
              src={shot.src}
              alt={shot.alt}
              width={473}
              height={1024}
              className={styles.image}
              sizes="(max-width: 768px) 220px, 280px"
            />
          </div>
          <figcaption className={styles.caption}>{shot.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}
