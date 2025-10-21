const FetchClient = require('./fetchClient.js');

class IdentifySlackUser {
  constructor(slackToken) {
    this.slackToken = slackToken;
    this.apiBaseURL = 'https://slack.com/api/';
  }

  async getSlackUserId(email) {
    if (!email?.trim()) {
      throw new Error('Email is required');
    }
    const client = new FetchClient();
    const url = `${this.apiBaseURL}users.lookupByEmail?email=${encodeURIComponent(email.trim())}`;

    try {
      const response = await client.request(url, {
        headers: {
          Authorization: `Bearer ${this.slackToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data?.ok || !data?.user?.id) {
        const errorMsg = data.error || 'Unknown error';
        console.error(`User data incomplete for email: ${email} `);
        throw new Error(`Slack API error: ${errorMsg}`);
      }
      return data.user.id;
    } catch (error) {
      throw new Error(`Error looking up user "${email} " in Slack.`);
    }
  }
}

module.exports = IdentifySlackUser;
