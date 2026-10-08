(() => {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';

  function toast(message) {
    let node = document.querySelector('.culturize-toast');
    if (!node) {
      node = document.createElement('div');
      node.className = 'culturize-toast';
      node.setAttribute('role', 'status');
      node.setAttribute('aria-live', 'polite');
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.hidden = false;
    clearTimeout(node._hideTimer);
    node._hideTimer = setTimeout(() => node.remove(), 3000);
  }

  function go(path) {
    window.location.assign(path);
  }

  function normalize(value) {
    return (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  function recipeIdForDish(raw) {
    const dish = normalize(raw);
    const recipes = [
      { id: 6, keys: ['jollof', 'west african party rice'] },
      { id: 5, keys: ['egusi'] },
      { id: 4, keys: ['kimchi jjigae', 'kimchi-jjigae', 'kimchi stew'] },
      { id: 3, keys: ['mole poblano', 'mole'] },
      { id: 2, keys: ['hyderabadi chicken biryani', 'chicken biryani', 'biryani'] },
      { id: 1, keys: ['pho bo', 'pho', 'phở bò'] },
    ];
    for (const item of recipes) {
      if (item.keys.some((key) => dish.includes(normalize(key)))) return item.id;
    }
    return null;
  }

  function locationQuery(zip) {
    return zip ? `&zip=${encodeURIComponent(zip)}` : '';
  }

  // Landing-page search: transfer the dish and ZIP to the kitchen form.
  if (pathname === '/') {
    const homeForm = document.querySelector('main form');
    if (homeForm) {
      homeForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const fields = homeForm.querySelectorAll('input');
        const dish = fields[0]?.value.trim() || '';
        const zip = fields[1]?.value.trim() || '';
        if (!dish) {
          toast('Tell us what dish you want to cook first.');
          fields[0]?.focus();
          return;
        }
        go(`/kitchen?dish=${encodeURIComponent(dish)}${locationQuery(zip)}`);
      });
    }
  }

  if (pathname === '/kitchen') {
    const dishInput = document.querySelector('#dish');
    const zipInput = document.querySelector('#zip');
    const ingredientInput = document.querySelector('#ingredient-query');
    const missingInput = document.querySelector('#missing-ingredient');
    const cuisineInput = document.querySelector('#cuisine');
    if (dishInput && params.has('dish')) dishInput.value = params.get('dish');
    if (zipInput && params.has('zip')) zipInput.value = params.get('zip');
    if (cuisineInput && params.has('cuisine')) cuisineInput.value = params.get('cuisine');
    if (ingredientInput && params.has('q')) ingredientInput.value = params.get('q');

    const modeForTab = (button) => {
      const text = normalize(button.textContent);
      if (text.includes('look up ingredient')) return 'ingredient';
      if (text.includes('missing ingredient')) return 'missing';
      if (text.includes('paste recipe')) return 'paste';
      return 'dish';
    };

    document.querySelectorAll('button[role="tab"]').forEach((button) => {
      button.addEventListener('click', () => {
        const mode = modeForTab(button);
        go(mode === 'dish' ? '/kitchen' : `/kitchen?mode=${mode}`);
      });
    });

    // The secondary action buttons on the kitchen page lead to the same modes.
    document.querySelectorAll('main button:not([role="tab"])').forEach((button) => {
      const text = normalize(button.textContent);
      let mode = null;
      if (text.includes('look up an ingredient')) mode = 'ingredient';
      else if (text.includes('missing ingredient')) mode = 'missing';
      else if (text.includes('paste a family recipe')) mode = 'paste';
      if (mode) button.addEventListener('click', () => go(`/kitchen?mode=${mode}`));
    });

    const form = document.querySelector('main form');
    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const mode = params.get('mode') || 'dish';
        const zip = zipInput?.value.trim() || '';

        if (mode === 'ingredient') {
          const query = ingredientInput?.value.trim() || '';
          if (!query) {
            toast('Enter an ingredient to look up.');
            ingredientInput?.focus();
            return;
          }
          go(`/substitutes?q=${encodeURIComponent(query)}${locationQuery(zip)}`);
          return;
        }

        if (mode === 'missing') {
          const query = missingInput?.value.trim() || '';
          if (!query) {
            toast('Tell us which ingredient you are missing.');
            missingInput?.focus();
            return;
          }
          go(`/substitutes?q=${encodeURIComponent(query)}${locationQuery(zip)}`);
          return;
        }

        if (mode === 'paste') {
          const pasted = document.querySelector('#ingredients')?.value.trim() || '';
          if (!pasted) {
            toast('Paste your family recipe to get started.');
            document.querySelector('#ingredients')?.focus();
            return;
          }
          toast('Browse the Cookbook for the six saved example recipes in this local copy.');
          return;
        }

        const dish = dishInput?.value.trim() || '';
        if (!dish) {
          toast('Tell us what dish you are craving.');
          dishInput?.focus();
          return;
        }
        const recipeId = recipeIdForDish(dish);
        if (recipeId) {
          go(`/recipes/${recipeId}`);
        } else {
          toast('No saved recipe for that dish in this local snapshot. Try a recipe from the Cookbook.');
        }
      });
    }

    // The example control intentionally uses the same ingredient list shown in its placeholder.
    document.querySelectorAll('button').forEach((button) => {
      if (normalize(button.textContent) === 'use an example list') {
        button.addEventListener('click', () => {
          const area = document.querySelector('#ingredients');
          if (area) area.value = '2 cups long-grain rice\n3 tbsp gochugaru\n1 tbsp fish sauce\n6 makrut lime leaves\n1 thumb galangal\n2 tbsp palm sugar\n1 lb chicken thighs\nSalt to taste';
        });
      }
    });

    // A lightweight local equivalent for the source app's servings control.
    const fewer = document.querySelector('[aria-label="Fewer servings"]');
    const more = document.querySelector('[aria-label="More servings"]');
    const servingCount = fewer?.parentElement?.querySelector('span');
    if (servingCount && fewer && more) {
      const readCount = () => {
        const n = parseInt(servingCount.textContent, 10);
        return Number.isFinite(n) ? n : null;
      };
      more.addEventListener('click', () => servingCount.textContent = String(Math.min(20, (readCount() ?? 2) + 1)));
      fewer.addEventListener('click', () => {
        const current = readCount();
        servingCount.textContent = current === null || current <= 2 ? 'Auto' : String(current - 1);
      });
    }

    document.querySelectorAll('input[name="style"]').forEach((input) => {
      input.addEventListener('change', () => {
        document.querySelectorAll('input[name="style"]').forEach((radio) => {
          const label = radio.closest('label');
          if (!label) return;
          label.classList.toggle('border-paprika', radio.checked);
          label.classList.toggle('bg-paprika/5', radio.checked);
          label.classList.toggle('border-clay', !radio.checked);
          label.classList.toggle('bg-white', !radio.checked);
        });
      });
    });
  }

  // Ingredient Library search and region filters.
  if (pathname === '/substitutes') {
    const search = document.querySelector('input[aria-label="Search ingredients"]');
    const articles = [...document.querySelectorAll('main article')];
    const countLine = [...document.querySelectorAll('p')].find((p) => p.textContent.includes('curated ingredients'));
    const regionTerms = {
      'Africa': ['nigerian', 'ghanaian', 'ethiopian', 'eritrean', 'senegalese', 'cameroonian', 'kenyan', 'rwandan', 'african', 'somali', 'sudanese'],
      'Caribbean': ['jamaican', 'trinidadian', 'guyanese', 'haitian', 'caribbean', 'puerto rican', 'dominican'],
      'Latin America': ['mexican', 'cuban', 'puerto rican', 'dominican', 'venezuelan', 'colombian', 'brazilian', 'peruvian', 'latin'],
      'East Asia': ['korean', 'japanese', 'chinese', 'taiwanese', 'east asian'],
      'Southeast Asia': ['vietnamese', 'thai', 'indonesian', 'malaysian', 'filipino', 'cambodian', 'lao', 'burmese', 'southeast asian'],
      'South Asia': ['indian', 'pakistani', 'bangladeshi', 'nepali', 'nepalese', 'sri lankan', 'south asian'],
      'Middle East & N. Africa': ['moroccan', 'egyptian', 'jordanian', 'palestinian', 'lebanese', 'syrian', 'iraqi', 'iranian', 'persian', 'middle eastern', 'north african'],
      'Europe': ['european', 'polish', 'georgian', 'french', 'italian', 'greek', 'spanish', 'portuguese', 'german', 'british'],
    };
    let region = '';

    function updateIngredientList() {
      const query = normalize(search?.value || '');
      let visible = 0;
      for (const article of articles) {
        const text = normalize(article.textContent);
        const matchesQuery = !query || text.includes(query);
        const terms = regionTerms[region];
        const matchesRegion = !terms || terms.some((term) => text.includes(term));
        const show = matchesQuery && matchesRegion;
        article.hidden = !show;
        if (show) visible += 1;
      }
      if (countLine) {
        const totalText = countLine.textContent.includes('202') ? '202' : '202';
        countLine.textContent = `Showing ${visible} of ${totalText} curated ingredients · search also checks wider food references`;
      }
    }

    if (search) {
      if (params.has('q')) search.value = params.get('q');
      search.addEventListener('input', updateIngredientList);
      search.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          const value = search.value.trim();
          if (value) go(`/substitutes?q=${encodeURIComponent(value)}`);
        }
      });
    }

    document.querySelectorAll('main button').forEach((button) => {
      const text = button.textContent.trim();
      if (text === 'All' || Object.prototype.hasOwnProperty.call(regionTerms, text)) {
        button.addEventListener('click', () => {
          region = text === 'All' ? '' : text;
          const active = button;
          const siblings = active.parentElement ? [...active.parentElement.querySelectorAll('button')] : [];
          for (const sibling of siblings) {
            sibling.classList.remove('bg-ink', 'text-cream');
            sibling.classList.add('border', 'border-clay', 'bg-white');
            if (sibling === active) {
              sibling.classList.remove('border', 'border-clay', 'bg-white', 'text-muted', 'hover:text-ink');
              sibling.classList.add('bg-ink', 'text-cream');
            }
          }
          updateIngredientList();
        });
      }
      if (normalize(text) === 'show more ingredients') {
        button.addEventListener('click', () => toast('Showing the first 24 ingredients from this source snapshot.'));
      }
    });
    updateIngredientList();
  }

  // Recipe detail page: tabs, share/print, pantry checklist, and copy list.
  if (/^\/recipes\/\d+$/.test(pathname)) {
    const ingredientHeading = [...document.querySelectorAll('h3')].find((el) => el.textContent.trim() === 'Ingredients & swaps');
    const ingredientBox = ingredientHeading?.closest('.rounded-3xl');
    const ingredientList = ingredientBox?.querySelector('ul');
    const filterButtons = ingredientBox ? [...ingredientBox.querySelectorAll('button')] : [];

    function setRecipeFilter(filter, activeButton) {
      if (ingredientList) {
        [...ingredientList.querySelectorAll(':scope > li')].forEach((item) => {
          const text = item.textContent;
          const isSwap = text.includes('Smart swap');
          const isAuthentic = text.includes('Authentic · nearby');
          item.hidden = filter === 'swaps' ? !isSwap : filter === 'authentic' ? !isAuthentic : false;
        });
      }
      filterButtons.forEach((button) => {
        button.classList.remove('bg-white', 'text-ink', 'shadow-sm');
        button.classList.add('text-muted', 'hover:text-ink');
        if (button === activeButton) {
          button.classList.remove('text-muted', 'hover:text-ink');
          button.classList.add('bg-white', 'text-ink', 'shadow-sm');
        }
      });
    }

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const text = normalize(button.textContent);
        setRecipeFilter(text.startsWith('swaps') ? 'swaps' : text.startsWith('authentic') ? 'authentic' : 'all', button);
      });
    });

    const checks = [...document.querySelectorAll('input[type="checkbox"]')];
    const cartLine = [...document.querySelectorAll('p')].find((p) => p.textContent.includes('in the cart'));
    function updateCartLine() {
      if (!cartLine) return;
      const total = checks.length;
      const checked = checks.filter((input) => input.checked).length;
      const price = cartLine.textContent.match(/[0-9]+\.[0-9]{2}/)?.[0] || '0.00';
      cartLine.textContent = `${checked} / ${total} in the cart · est. $ ${price}`;
    }
    checks.forEach((input) => input.addEventListener('change', updateCartLine));

    const copyButton = [...document.querySelectorAll('button')].find((button) => normalize(button.textContent) === 'copy list');
    if (copyButton) {
      copyButton.addEventListener('click', async () => {
        const items = checks.map((input) => input.closest('label')?.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean);
        const text = items.join('\n');
        try {
          await navigator.clipboard.writeText(text);
          toast('Shopping list copied.');
        } catch {
          toast('Select and copy the shopping list from this page.');
        }
      });
    }

    document.querySelectorAll('button').forEach((button) => {
      const text = normalize(button.textContent);
      if (text.includes('share')) {
        button.addEventListener('click', async () => {
          const shareData = { title: document.title, url: window.location.href };
          if (navigator.share) {
            try { await navigator.share(shareData); } catch { /* dismissed */ }
          } else if (navigator.clipboard) {
            try { await navigator.clipboard.writeText(window.location.href); toast('Recipe link copied.'); }
            catch { toast('Use your browser address bar to share this recipe.'); }
          }
        });
      } else if (text.includes('print')) {
        button.addEventListener('click', () => window.print());
      } else if (text === 'delete') {
        button.addEventListener('click', () => {
          if (window.confirm('Remove this recipe from the cookbook?')) {
            const article = document.querySelector('main article');
            if (article) article.remove();
            toast('Recipe removed from this view.');
          }
        });
      }
    });
  }

  // Use the device geolocation control where the browser grants permission.
  document.querySelectorAll('button[title="Use my location"]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!navigator.geolocation) {
        toast('Location is unavailable in this browser. Enter a ZIP code instead.');
        return;
      }
      button.disabled = true;
      button.textContent = 'Locating…';
      navigator.geolocation.getCurrentPosition(
        (position) => {
          try {
            localStorage.setItem('culturize-location', JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }));
          } catch { /* optional browser storage */ }
          button.disabled = false;
          button.textContent = '📍 Locate';
          toast('Location detected. Add a ZIP to see the local store examples.');
        },
        () => {
          button.disabled = false;
          button.textContent = '📍 Locate';
          toast('Could not get your location. Enter a ZIP code instead.');
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
      );
    });
  });
})();
