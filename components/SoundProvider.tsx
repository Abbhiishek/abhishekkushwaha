'use client';

import { bind, play, setEnabled, sounds, type SoundName } from 'cuelume';
import { usePathname } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const soundPreferenceKey = 'portfolio-sound-enabled';
const interactiveSelector = [
  'a[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'summary',
  '[role="button"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="switch"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

type SoundContextValue = {
  enabled: boolean;
  playSound: (sound: SoundName) => void;
  toggleSound: () => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

function preferredHoverSound(element: HTMLElement): SoundName {
  if (element.closest('[data-sound-density="dense"]')) return 'whisper';
  if (element.closest('nav, [role="menu"], [data-sound-zone="navigation"]'))
    return 'tick';
  return 'chime';
}

function decorateInteractiveElement(element: HTMLElement) {
  if (element.closest('[data-cuelume-silent]')) return;
  if (element.matches(':disabled, [aria-disabled="true"]')) return;

  if (!element.hasAttribute('data-cuelume-hover')) {
    element.setAttribute('data-cuelume-hover', preferredHoverSound(element));
  }

  const isToggle = element.matches(
    '[role="switch"], input[type="checkbox"], input[type="radio"], [aria-pressed]'
  );

  if (isToggle && !element.hasAttribute('data-cuelume-toggle')) {
    element.setAttribute('data-cuelume-toggle', 'toggle');
  }

  if (!isToggle && !element.hasAttribute('data-cuelume-toggle')) {
    if (!element.hasAttribute('data-cuelume-press')) {
      element.setAttribute('data-cuelume-press', 'press');
    }
    if (!element.hasAttribute('data-cuelume-release')) {
      element.setAttribute('data-cuelume-release', 'release');
    }
  }
}

function decorateInteractiveTree(root: ParentNode) {
  if (root instanceof HTMLElement && root.matches(interactiveSelector)) {
    decorateInteractiveElement(root);
  }

  root
    .querySelectorAll<HTMLElement>(interactiveSelector)
    .forEach(decorateInteractiveElement);
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const [enabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const storedPreference = window.localStorage.getItem(soundPreferenceKey);
    const initialEnabled = storedPreference !== 'false';

    setEnabled(initialEnabled);
    if (!initialEnabled) {
      window.queueMicrotask(() => setSoundEnabled(false));
    }
    decorateInteractiveTree(document);
    bind();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) decorateInteractiveTree(node);
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    let keyboardNavigation = false;
    const handleKeyDown = (event: KeyboardEvent) => {
      keyboardNavigation = event.key === 'Tab';
    };
    const handlePointerDown = () => {
      keyboardNavigation = false;
    };
    const handleFocus = (event: FocusEvent) => {
      if (!keyboardNavigation || !(event.target instanceof HTMLElement)) return;

      const target = event.target.closest<HTMLElement>(interactiveSelector);
      if (!target || target.closest('[data-cuelume-silent]')) return;

      const requestedSound = target.getAttribute('data-cuelume-hover');
      const sound = sounds.includes(requestedSound as SoundName)
        ? (requestedSound as SoundName)
        : 'tick';
      play(sound);
      keyboardNavigation = false;
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('focusin', handleFocus, true);

    return () => {
      observer.disconnect();
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('focusin', handleFocus, true);
    };
  }, []);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;

    const arrivalCue = window.setTimeout(() => play('bloom'), 90);
    return () => window.clearTimeout(arrivalCue);
  }, [pathname]);

  const playSound = useCallback((sound: SoundName) => play(sound), []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((currentlyEnabled) => {
      const nextEnabled = !currentlyEnabled;

      if (currentlyEnabled) {
        play('droplet');
        setEnabled(false);
      } else {
        setEnabled(true);
        play('bloom');
      }

      window.localStorage.setItem(soundPreferenceKey, String(nextEnabled));
      return nextEnabled;
    });
  }, []);

  const value = useMemo(
    () => ({ enabled, playSound, toggleSound }),
    [enabled, playSound, toggleSound]
  );

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) throw new Error('useSound must be used within SoundProvider');
  return context;
}
