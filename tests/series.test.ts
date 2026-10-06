import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { getSeriesList, getSeriesBySlug } from "../src/server/events/series";

describe("Meetup Series & Hackathon Series ()", () => {
  describe("Meetup Series Queries & Auto-Computed Impact Stats ()", () => {
    it("should fetch all Meetup Series (RaibarX, PadharoX, TricityX)", async () => {
      const meetups = await getSeriesList("MEETUP");
      assert.ok(Array.isArray(meetups));
      assert.ok(meetups.length >= 3, "Must have at least RaibarX, PadharoX, and TricityX");

      const slugs = meetups.map((s) => s.slug.toLowerCase());
      assert.ok(slugs.includes("raibarx"));
      assert.ok(slugs.includes("padharox"));
      assert.ok(slugs.includes("tricityx"));

      for (const series of meetups) {
        assert.equal(series.kind, "MEETUP");
        assert.ok(series.name);
        assert.ok(series.purpose || series.description);
        assert.ok(typeof series.stats.totalEditions === "number");
        assert.ok(typeof series.stats.totalAttendees === "number");
        assert.ok(typeof series.stats.totalSpeakers === "number");
      }
    });

    it("should fetch series details by slug with editions timeline, speakers, and gallery", async () => {
      const data = await getSeriesBySlug("raibarx");
      assert.ok(data);
      assert.ok(data.series);
      assert.equal(data.series.slug, "raibarx");
      assert.equal(data.series.name, "RaibarX");

      // Verify auto-computed impact stats
      assert.ok(data.stats.totalEditions >= 2, "RaibarX has at least 2 editions");
      assert.ok(data.stats.totalAttendees > 0);
      assert.ok(data.stats.totalSpeakers > 0);

      // Verify timeline editions
      assert.ok(Array.isArray(data.editions));
      assert.ok(data.editions.length >= 2);
      assert.equal(data.editions[0].editionNo, 1);
      assert.equal(data.editions[1].editionNo, 2);

      // Verify speakers pool
      assert.ok(Array.isArray(data.allSpeakers));
      assert.ok(data.allSpeakers.length > 0);
      assert.ok(data.allSpeakers[0].name);

      // Verify partners
      assert.ok(Array.isArray(data.allPartners));
    });
  });

  describe("Hackathon Series Queries & Edition Features ()", () => {
    it("should fetch all Hackathon Series (NirmanX, AarambhX)", async () => {
      const hackathons = await getSeriesList("HACKATHON");
      assert.ok(Array.isArray(hackathons));
      assert.ok(hackathons.length >= 2, "Must have at least NirmanX and AarambhX");

      const slugs = hackathons.map((s) => s.slug.toLowerCase());
      assert.ok(slugs.includes("nirmanx"));
      assert.ok(slugs.includes("aarambhx"));

      for (const series of hackathons) {
        assert.equal(series.kind, "HACKATHON");
        assert.ok(series.stats.totalPrizePool);
      }
    });

    it("should fetch NirmanX hackathon details with tracks, problem statements, rules, team size, timeline, prizes, judges, mentors, sponsors, submission link, and results", async () => {
      const data = await getSeriesBySlug("nirmanx");
      assert.ok(data);
      assert.ok(data.series);
      assert.equal(data.series.slug, "nirmanx");

      // Check editions
      assert.ok(data.editions.length >= 2, "NirmanX should have Season 01 and Season 02");

      const season01 = data.editions.find((e) => e.editionNo === 1);
      assert.ok(season01, "Season 01 edition must exist");

      const detail = season01?.event.hackathonDetail;
      assert.ok(detail, "Season 01 must have HackathonDetail");

      // 1. Team size
      assert.equal(detail?.minTeamSize, 2);
      assert.equal(detail?.maxTeamSize, 4);

      // 2. Rules
      assert.ok(detail?.rules);
      assert.match(detail?.rules || "", /36-hour/);

      // 3. Problem statements
      const problemStatements = detail?.problemStatements as Array<{
        id: string;
        title: string;
        track: string;
        description: string;
      }>;
      assert.ok(Array.isArray(problemStatements));
      assert.ok(problemStatements.length >= 3);
      assert.ok(problemStatements[0].track);
      assert.ok(problemStatements[0].title);

      // 4. Prizes
      const prizes = detail?.prizes as Array<{
        title: string;
        amount: string;
        perks: string[];
      }>;
      assert.ok(Array.isArray(prizes));
      assert.ok(prizes.length >= 3);
      assert.match(prizes[0].amount, /₹2,50,000/);

      // 5. Tracks
      assert.ok(season01?.event.tracks.length >= 3);
      assert.ok(season01?.event.tracks.some((t) => t.name.includes("Distributed Systems")));

      // 6. Submission link
      assert.ok(detail?.submissionUrl);
      assert.match(detail?.submissionUrl || "", /github\.com/);

      // 7. Results & Winners
      const results = detail?.results as Array<{
        rank: number;
        title: string;
        teamName: string;
        projectName: string;
        repoUrl?: string;
      }>;
      assert.ok(Array.isArray(results));
      assert.equal(results[0].rank, 1);
      assert.equal(results[0].teamName, "VectorNodes");
      assert.ok(results[0].repoUrl);

      // 8. Judges & Mentors
      const judges = season01?.event.speakers.filter((s) => s.role === "JUDGE");
      const mentors = season01?.event.speakers.filter((s) => s.role === "MENTOR");
      assert.ok(judges && judges.length > 0, "Must have judges assigned to hackathon");
      assert.ok(mentors && mentors.length > 0, "Must have mentors assigned to hackathon");

      // 9. Sponsors
      assert.ok(season01?.event.partners.length > 0);
    });

    it("should fetch AarambhX rookie hackathon details with student problem statements and beginner tracks", async () => {
      const data = await getSeriesBySlug("aarambhx");
      assert.ok(data);
      assert.ok(data.series);
      assert.equal(data.series.slug, "aarambhx");

      const edition01 = data.editions.find((e) => e.editionNo === 1);
      assert.ok(edition01);

      const detail = edition01?.event.hackathonDetail;
      assert.ok(detail);
      assert.equal(detail?.minTeamSize, 1);
      assert.equal(detail?.maxTeamSize, 4);

      const pss = detail?.problemStatements as Array<{ title: string; track: string }>;
      assert.ok(pss.length >= 2);
    });
  });
});
