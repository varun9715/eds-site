import { getLink, getEDSLink } from '../../scripts/scripts.js';
import { getContentService } from '../../scripts/utils/common-utils.js';
import {
  MENU_TYPE,
  EVENT_NAME,
  triggerMenuClickEventFromElement,
} from '../../scripts/martech/datalayer.js';
/*
Output example:
[
    { path: '/en-au', title: 'Home' },
    { path: '/en-au/about-us', title: 'About Us' },
    { path: '/en-au/about-us/our-company', title: 'Our Company' },
  ],
*/

function getTitle(node) {
  return node?.['jcr:title'] || '';
}

export async function fetchBreadcrumbData() {
  const breadcrumbData = [];

  try {
    const pageInfoApiURL = `${getContentService()}${getEDSLink(document.location.pathname)}.pageinfo.parent.json`;
    const res = await fetch(pageInfoApiURL);
    if (!res.ok) throw new Error('Failed to fetch breadcrumb data');

    const data = await res.json();

    const pushBreadcrumb = (node) => {
      const title = getTitle(node);
      const path = node.pagePath;
      const hidden = node.hidebreadcrumb;

      // Stop if no valid title/path or explicitly hidden
      if (!title || !path || hidden === true) return;

      breadcrumbData.unshift({ title, path });
    };

    // Add current page
    pushBreadcrumb(data?.currentPage);

    // Traverse up the parent chain
    let current = data.parent;

    while (current && current.pageDepth !== 2) {
      pushBreadcrumb(current);
      current = current.parent;
    }

    // Schema.org JSON-LD injection
    const schemaBreadcrumbs = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbData.map((item, idx) => {
        const listItem = {
          '@type': 'ListItem',
          position: idx + 1,
          name: item.title,
        };
        if (idx < breadcrumbData.length - 1) {
          listItem.item = `https://www.qantas.com${item.path}`;
        }
        return listItem;
      }),
    };

    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.id = 'breadcrumb-schema';
    schemaScript.textContent = JSON.stringify(schemaBreadcrumbs);
    document.head.appendChild(schemaScript);

    return breadcrumbData;
  } catch (err) {
    console.error('Breadcrumb fetch error:', err);
    return [];
  }
}

/*
Output example:

<nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li><a href="/en-au">EN AU</a></li>
    <li><a href="/en-au/about-us">About Us</a></li>
    <li class="currentPage" aria-current="page">Our Company | Qantas</li>
  </ol>
</nav>
*/
export function buildBreadcrumbs(block, breadcrumbData) {
  // to avoid duplication when editing
  block.textContent = '';

  const breadcrumbNav = document.createElement('nav');
  breadcrumbNav.setAttribute('aria-label', 'breadcrumb');

  const breadcrumbList = document.createElement('ol');
  breadcrumbList.classList.add('breadcrumb');

  breadcrumbData.forEach(({ path, title }, index, array) => {
    const breadcrumbItem = document.createElement('li');
    breadcrumbItem.classList.add('caption');

    if (index !== array.length - 1) {
      const link = document.createElement('a');

      link.setAttribute('href', getLink(path));
      link.appendChild(document.createTextNode(title));

      link.setAttribute('data-wae-event', EVENT_NAME.MENU_CLICK);
      link.setAttribute('data-wae-menu-type', MENU_TYPE.BREADCRUMBS);
      link.setAttribute('data-wae-menu-level', '1');

      link.addEventListener('click', () => triggerMenuClickEventFromElement(link));

      breadcrumbItem.appendChild(link);
    } else {
      const span = document.createElement('span');
      span.appendChild(document.createTextNode(title));
      breadcrumbItem.appendChild(span);
      breadcrumbItem.setAttribute('aria-current', 'page');
      breadcrumbItem.classList.add('currentPage');
    }

    breadcrumbList.appendChild(breadcrumbItem);
  });

  breadcrumbNav.appendChild(breadcrumbList);
  block.appendChild(breadcrumbNav);
}

export default async function decorate(block) {
  try {
    const breadcrumbData = await fetchBreadcrumbData();

    buildBreadcrumbs(block, breadcrumbData);
  } catch (error) {
    console.error('Error fetching breadcrumb data:', error);
  }
}
