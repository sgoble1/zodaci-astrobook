import type { PlaceScene } from '@/lib/observatory';
import broadcastStudio from '@/assets/places/broadcast-studio.jpg';
import astralMapping from '@/assets/places/astral-mapping.jpg';
import navigationChamber from '@/assets/places/navigation-chamber.jpg';
import cosmicArchive from '@/assets/places/cosmic-archive.jpg';
import relationshipBureau from '@/assets/places/relationship-bureau.jpg';
import researchLibrary from '@/assets/places/research-library.jpg';
import timelineHall from '@/assets/places/timeline-hall.jpg';
import founderCommand from '@/assets/places/founder-command.jpg';
import grandObservatory from '@/assets/places/grand-observatory.jpg';
import observationDeck from '@/assets/places/observation-deck.jpg';
import giftShop from '@/assets/places/gift-shop.jpg';
import radioRoom from '@/assets/places/radio-room.jpg';
import comicPress from '@/assets/places/comic-press.jpg';
import writingRoom from '@/assets/pages/desk-astrologer.jpg';

/** 1950s poster illustration for each place (1536×640 banners). */
export const PLACE_SCENES: Record<PlaceScene, string> = {
  'broadcast-studio': broadcastStudio, 'astral-mapping': astralMapping, 'navigation-chamber': navigationChamber, 'cosmic-archive': cosmicArchive,
  'relationship-bureau': relationshipBureau, 'research-library': researchLibrary, 'timeline-hall': timelineHall, 'founder-command': founderCommand,
  'grand-observatory': grandObservatory, 'observation-deck': observationDeck, 'gift-shop': giftShop, 'radio-room': radioRoom, 'comic-press': comicPress,
  'writing-room': writingRoom,
};
