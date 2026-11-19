import { useEffect } from 'react';

const DEFAULT_TITLE = 'ShopSphere – Shop smarter, live better';

/** Sets the browser tab title for the current page: useDocumentTitle('Cart') -> "Cart | ShopSphere". */
export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ShopSphere` : DEFAULT_TITLE;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title]);
}
