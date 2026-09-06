export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  try {
    const response = await fetch(
      'https://api.rankedin.com/v1/teamleague/GetTeamMatchesAsync?teamid=3281205&language=en'
    );
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
