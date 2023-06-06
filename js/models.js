'use strict';

const BASE_URL = 'https://hack-or-snooze-v3.herokuapp.com';

class Story {
  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  getHostName() {
    const hostName = new URL(this.url).hostname;
    return hostName;
  }
}

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  static async getStories() {
    try {
      const response = await axios.get(`${BASE_URL}/stories`, { limit: 50 });

      const stories = response.data.stories.map((story) => new Story(story));
      return new StoryList(stories);
    } catch (error) {
      console.error(`The server cannot find the requested resource`);
    }
  }

  async addStory(currentUser, { title, author, url }) {
    try {
      const token = currentUser.loginToken;
      const res = await axios.post(`${BASE_URL}/stories`, {
        token,
        story: { title, author, url },
      });

      const newStory = new Story(res.data.story);
      this.stories.unshift(newStory);
      currentUser.ownStories.unshift(newStory);

      return newStory;
    } catch (error) {
      console.error(
        'Request has not been completed because it lacks valid authentication credentials for the requested resource.'
      );
      alert('Must be logged in to upload a story.');
    }
  }

  async deleteStory(currentUser, storyId) {
    const token = currentUser.loginToken;
    await axios.delete(`${BASE_URL}/stories/${storyId}`, { params: { token } });

    this.stories = this.stories.filter((story) => story.storyId !== storyId);

    currentUser.ownStories = currentUser.ownStories.filter(
      (s) => s.storyId !== storyId
    );
    currentUser.favorites = currentUser.favorites.filter(
      (s) => s.storyId !== storyId
    );
  }
}

class User {
  constructor(
    { username, name, createdAt, favorites = [], ownStories = [] },
    token
  ) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    this.favorites = favorites.map((s) => new Story(s));
    this.ownStories = ownStories.map((s) => new Story(s));

    this.loginToken = token;
  }

  static async signup(username, password, name) {
    try {
      const response = await axios.post(`${BASE_URL}/signup`, {
        user: { username, password, name },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        response.data.token
      );
    } catch (error) {
      console.error(error);
    }
  }

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: 'POST',
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: 'GET',
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        token
      );
    } catch (err) {
      console.error('loginViaStoredCredentials failed', err);
      return null;
    }
  }

  async addFavorite(story) {
    this.favorites.push(story);
    await this._toggleFavorite('add', story);
  }

  async removeFavorite(story) {
    this.favorites = this.favorites.filter((s) => s.storyId !== story.storyId);
    await this._toggleFavorite('remove', story);
  }

  async _toggleFavorite(action, story) {
    const method = action === 'add' ? 'POST' : 'DELETE';
    const token = this.loginToken;

    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method,
      data: { token },
    });
  }

  isFavorite(story) {
    return this.favorites.some((s) => s.storyId === story.storyId);
  }
}
