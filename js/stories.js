'use strict';

let storyList;

async function getAndShowStoriesOnStart() {
  console.debug('getAndShowStoriesOnStart');

  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

function generateStoryMarkup(story) {
  const hostname = story.getHostName();
  const shouldShowHeart = Boolean(currentUser);

  return $(`
    <li id="${story.storyId}">
      ${shouldShowHeart ? generateHeartMarkup(story, currentUser) : ''}
      <a href="${story.url}" target="_blank" class="story-link">
        ${story.title}
      </a>
      <small class="story-hostname">(${hostname})</small>
      <small class="story-author">by ${story.author}</small>
      <small class="story-user">posted by ${story.username}</small>
    </li>
  `);

  function generateHeartMarkup(story, currentUser) {
    const isFavorite = currentUser.isFavorite(story);
    const heartType = isFavorite ? 'fa-sharp fa-solid' : 'fa-sharp fa-regular';

    return `
      <span class="heart">
        <i class="${heartType} fa-heart"></i>
      </span>
    `;
  }
}

function putStoriesOnPage() {
  console.debug('putStoriesOnPage');

  $allStoriesList.empty();

  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

$body.on('click', '#submit-new-story', addNewStoryOnPage);

async function addNewStoryOnPage() {
  const $newAuthor = $('#new-author').val();
  const $newTitle = $('#new-title').val();
  const $newurl = $('#new-url').val();

  let newStory = await storyList.addStory(currentUser, {
    title: $newTitle,
    author: $newAuthor,
    url: $newurl,
  });

  location.reload();
}

function putFavoritesListOnPage() {
  console.debug('putFavoritesListOnPage');

  $favoritedStories.empty();
  hidePageComponents();

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append('<h5>No favorites added!</h5>');
  } else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }

  $favoritedStories.show();
}

$body.on('click', '#nav-favorites', putFavoritesListOnPage);

async function alterFavorites(evt) {
  console.debug('alterFavorites');

  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest('li');
  const storyId = $closestLi.attr('id');
  const story = storyList.stories.find((s) => s.storyId === storyId);

  const isCurrentlyFavorite = $tgt.hasClass('fa-solid');

  if (isCurrentlyFavorite) {
    $tgt
      .removeClass('fa-sharp fa-solid fa-heart')
      .addClass('fa-sharp fa-regular fa-heart');
    await currentUser.removeFavorite(story);
  } else {
    $tgt
      .removeClass('fa-sharp fa-regular fa-heart')
      .addClass('fa-sharp fa-solid fa-heart');
    await currentUser.addFavorite(story);
  }
}

$storiesLists.on('click', '.heart', alterFavorites);
