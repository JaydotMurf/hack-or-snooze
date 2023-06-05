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
  const shouldShowTrash = (story.username === currentUser.username);

  return $(`
    <li id="${story.storyId}">
    ${shouldShowTrash ? generateTrashMarkup() : ""}
      ${shouldShowHeart ? generateHeartMarkup(story, currentUser) : ''}
      <a href="${story.url}" target="_blank" class="story-link">
        ${story.title}
      </a>
      <small class="story-hostname">(${hostname})</small>
      <small class="story-author">by ${story.author}</small>
      <small class="story-user">posted by ${story.username}</small>
    </li>
  `);

  function generateTrashMarkup() {
    return `
        <span class="trash-can">
        <i class="fa-solid fa-trash"></i>
        </span>`;
  }

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

async function deleteOwnStory(evt) {
  console.debug("deleteOwnStory");

  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");
  console.log(storyId);

  await storyList.deleteStory(currentUser, storyId);

  putUserStoriesOnPage();
}

$ownStories.on("click", ".trash-can", deleteOwnStory);

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

function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  hidePageComponents()
  $ownStories.empty();

  if (currentUser.ownStories.length === 0) {
    $ownStories.append("<h5>No stories added by user yet!</h5>");
  } else {
    // loop through all of users stories and generate HTML for them
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true);
      $ownStories.append($story);
    }
  }

  $ownStories.show();
}

$body.on('click', '#nav-my-stories', putUserStoriesOnPage);

function putFavoritesListOnPage() {
  console.debug('putFavoritesListOnPage');

  if (currentUser === undefined){
    $favoritedStories.empty();
    hidePageComponents();
    $favoritedStories.append('<h5>Must be logged in to show favorites!</h5>');
    $favoritedStories.show();
    return
  }

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
