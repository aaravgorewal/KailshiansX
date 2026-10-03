// tests/gallery.test.ts
// Test suite for KailshiansX Gallery (PRD §18)

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getGalleryOverview, getGalleryAlbumById } from "../src/server/gallery/queries";
import { GALLERY_CATEGORIES } from "../src/lib/gallery";
import { createPresignedUploadUrl } from "../src/lib/storage";

describe("Gallery System (PRD §18)", () => {
  describe("Gallery Categories & Navigation", () => {
    it("should define all 6 required categories plus ALL", () => {
      const keys = GALLERY_CATEGORIES.map((c) => c.key);
      assert.ok(keys.includes("ALL"));
      assert.ok(keys.includes("meetup"), "Must include Meetups");
      assert.ok(keys.includes("hackathon"), "Must include Hackathons");
      assert.ok(keys.includes("workshop"), "Must include Workshops");
      assert.ok(keys.includes("tech-talk"), "Must include Tech Talks");
      assert.ok(keys.includes("community"), "Must include Community");
      assert.ok(keys.includes("bts"), "Must include Behind the Scenes");
      assert.equal(GALLERY_CATEGORIES.length, 7);
    });
  });

  describe("Gallery Database Queries", () => {
    it("should fetch gallery overview with albums and category counts", async () => {
      const overview = await getGalleryOverview();

      assert.ok(Array.isArray(overview.albums));
      assert.ok(overview.albums.length > 0, "Should have albums");
      assert.ok(overview.totalImagesCount > 0, "Should have total photo count");
      assert.ok(typeof overview.categoryCounts === "object");
      assert.ok(Array.isArray(overview.eventsWithAlbums));

      // Check album data integrity
      const firstAlbum = overview.albums[0];
      assert.ok(firstAlbum.id);
      assert.ok(firstAlbum.title);
      assert.ok(firstAlbum.category);
      assert.ok(firstAlbum._count.images >= 0);
    });

    it("should filter albums by category", async () => {
      const hackathonOverview = await getGalleryOverview({ category: "hackathon" });
      assert.ok(Array.isArray(hackathonOverview.albums));
      for (const album of hackathonOverview.albums) {
        assert.equal(album.category.toLowerCase(), "hackathon");
      }

      const workshopOverview = await getGalleryOverview({ category: "workshop" });
      assert.ok(Array.isArray(workshopOverview.albums));
      for (const album of workshopOverview.albums) {
        assert.equal(album.category.toLowerCase(), "workshop");
      }
    });

    it("should filter albums by search query", async () => {
      const searchResult = await getGalleryOverview({ search: "NirmanX" });
      assert.ok(Array.isArray(searchResult.albums));
      for (const album of searchResult.albums) {
        const matchesTitle = album.title.toLowerCase().includes("nirmanx");
        const matchesEvent = album.event?.title.toLowerCase().includes("nirmanx");
        assert.ok(matchesTitle || matchesEvent, "Search result should match query");
      }
    });

    it("should fetch an individual album by ID with all images and event info", async () => {
      const overview = await getGalleryOverview();
      assert.ok(overview.albums.length > 0);

      const targetId = overview.albums[0].id;
      const data = await getGalleryAlbumById(targetId);

      assert.ok(data);
      assert.ok(data.album);
      assert.equal(data.album.id, targetId);
      assert.ok(Array.isArray(data.album.images));
      assert.ok(Array.isArray(data.relatedAlbums));

      if (data.album.images.length > 0) {
        const firstImg = data.album.images[0];
        assert.ok(firstImg.id);
        assert.ok(firstImg.url);
        assert.ok(typeof firstImg.sortOrder === "number");
      }
    });
  });

  describe("S3-Compatible Storage & Presigned URLs", () => {
    it("should generate a valid presigned upload URL payload", async () => {
      const res = await createPresignedUploadUrl({
        albumId: "test-album-123",
        filename: "demo photo.jpg",
        contentType: "image/jpeg",
      });

      assert.ok(res.uploadUrl, "Must return uploadUrl");
      assert.ok(res.fileUrl, "Must return fileUrl");
      assert.ok(res.key, "Must return storage key");
      assert.ok(res.key.startsWith("gallery/test-album-123/"));
      assert.ok(res.key.endsWith("demo_photo.jpg"));
    });
  });
});
