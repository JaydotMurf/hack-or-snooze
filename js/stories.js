"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  console.debug('getAndShowStoriesOnStart');

  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup");

  const hostname = story.getHostName();
  const shouldShowHeart = Boolean(currentUser);

  return $(`
    <li id="${story.storyId}">
      ${shouldShowHeart ? generateHeartMarkup(story, currentUser) : ""}
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
    const heartType = isFavorite ? "fa-sharp fa-solid" : "fa-sharp fa-regular";

    return `
      <span class="heart">
        <i class="${heartType} fa-heart"></i>
      </span>
    `;
  }
}



/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

$body.on("click", "#submit-new-story", addNewStoryOnPage);

async function addNewStoryOnPage(){
  const $newAuthor = $("#new-author").val()
  const $newTitle = $("#new-title").val()
  const $newurl = $("#new-url").val()

  let newStory = await storyList.addStory(currentUser, {title: $newTitle, author: $newAuthor, url: $newurl})

  location.reload()
}

/******************************************************************************
 * Functionality for favorites list and starr/un-starr a story
 */

/** Put favorites list on page. */

function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");

  $favoritedStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>No favorites added!</h5>");
  } else {
    // loop through all of users favorites and generate HTML for them
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }

  $favoritedStories.show();
}

/** Handle favorite/un-favorite a story */

async function alterFavorites(evt) {
  console.debug("alterFavorites");

  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find((s) => s.storyId === storyId);

  const isCurrentlyFavorite = $tgt.hasClass("fa-solid");

  if (isCurrentlyFavorite) {
    $tgt.removeClass("fa-sharp fa-solid fa-heart").addClass("fa-sharp fa-regular fa-heart");
    await currentUser.removeFavorite(story);
  } else {
    $tgt.removeClass("fa-sharp fa-regular fa-heart").addClass("fa-sharp fa-solid fa-heart");
    await currentUser.addFavorite(story);
  }
}

$storiesLists.on("click", ".heart", alterFavorites);


