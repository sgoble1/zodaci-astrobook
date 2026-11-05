import { forwardRef } from 'react';
import { Link, useLocation, type LinkProps } from 'react-router-dom';
import { startLinkFrom } from '@/lib/onboardingReturn';

/**
 * Link to birth-detail entry that brings the member back to the current page once their
 * details are saved (instead of always dropping them on the dashboard).
 */
export const StartLink = forwardRef<HTMLAnchorElement, Omit<LinkProps, 'to'>>(function StartLink(props, ref) {
  const { pathname, search } = useLocation();
  return <Link ref={ref} {...props} to={startLinkFrom(`${pathname}${search}`)} />;
});
