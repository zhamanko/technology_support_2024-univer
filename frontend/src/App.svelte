<script>
  const { VITE_PORT: PORT = 3000 } = import.meta.env;

  import { List, Li, Search, Button, Spinner, Heading } from 'flowbite-svelte';
  import { SearchOutline } from 'flowbite-svelte-icons';

  let itemsAll = { data: [], count: 0 };
  let itemsYear = { data: [], count: 0 };
  let urlAll = '';
  let urlYear = '';
  let isLoadingAll = false;
  let isLoadingYear = false;

  async function fetchDataAll() {
    isLoadingAll = true;
    const { owner, repo } = parseUrl(urlAll);
    itemsAll = await fetchData({ type: 'all', owner, repo });
    isLoadingAll = false;
  }

  async function fetchDataYear() {
    isLoadingYear = true;
    const { owner, repo } = parseUrl(urlYear);
    itemsYear = await fetchData({ type: 'year', owner, repo });
    isLoadingYear = false;
  }

  async function fetchData({ type, owner, repo }) {
    try {
      const response = await fetch(
        `http://localhost:${PORT}/getTopRepositories?owner=${owner}&repo=${repo}&type=${type}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  function parseUrl(url) {
    try {
      if (url) {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        const owner = pathParts[1];
        const repo = pathParts[2];
        return { owner, repo };
      }
    } catch (error) {
      console.error('Error parsing URL:', error);
    }
  }
</script>

<div class="flex justify-between space-x-16 items-start dark">
  <div class="w-full">
    <Heading tag="h3">TOP 5 Repository ~1 year</Heading>
    <form class="flex gap-2">
      <Search size="md" bind:value={urlYear} placeholder="Enter GitHub Repository URL" />
      <Button class="!p-2.5" on:click={fetchDataYear} disabled={isLoadingYear}>
        {#if isLoadingYear}
          <Spinner class="me-3" size="4" color="white" />
        {/if}
        <SearchOutline class="w-5 h-5" />
      </Button>
    </form>

    <List tag="ul" list="none" class="max-w-full divide-y divide-gray-200 dark:divide-gray-700">
      {#each itemsYear.data as item}
        <Li class="pb-3 sm:pb-4 py-4">
          <div class="flex items-center space-x-4 rtl:space-x-reverse">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate dark:text-white">{item.name}</p>
              <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                <a href={item.url} class="text-blue-500 hover:underline">{item.url}</a>
              </p>
            </div>
            <div class="text-base font-semibold text-gray-900 dark:text-white px-4">
              {item.count}
            </div>
          </div>
        </Li>
      {/each}
    </List>
  </div>

  <div class="w-full">
    <Heading tag="h3">TOP 5 Repository</Heading>
    <form class="flex gap-2">
      <Search size="md" bind:value={urlAll} placeholder="Enter GitHub Repository URL" />
      <Button class="!p-2.5" on:click={fetchDataAll} disabled={isLoadingAll}>
        {#if isLoadingAll}
          <Spinner class="me-3" size="4" color="white" />
        {/if}
        <SearchOutline class="w-5 h-5" />
      </Button>
    </form>

    <List tag="ul" list="none" class="max-w-full divide-y divide-gray-200 dark:divide-gray-700">
      {#each itemsAll.data as item}
        <Li class="pb-3 sm:pb-4 py-4">
          <div class="flex items-center space-x-4 rtl:space-x-reverse">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate dark:text-white">{item.name}</p>
              <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                <a href={item.url} class="text-blue-500 hover:underline">{item.url}</a>
              </p>
            </div>
            <div class="text-base font-semibold text-gray-900 dark:text-white px-4">
              {item.count}
            </div>
          </div>
        </Li>
      {/each}
    </List>
  </div>
</div>
