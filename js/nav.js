'use strict';

function navAllStories(evt) {
  console.debug('navAllStories');
  hidePageComponents();
  putStoriesOnPage();
}

$body.on('click', '#nav-all', navAllStories);

function navLoginClick(evt) {
  console.debug('navLoginClick');
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on('click', navLoginClick);

function updateNavOnLogin() {
  console.debug('updateNavOnLogin');
  $('.main-nav-links').show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

function submitNewStory(evt) {
  console.debug('submitNewStory');

  hidePageComponents();
  $newStoryForm.show();
}

$body.on('click', '#nav-submit', submitNewStory);
