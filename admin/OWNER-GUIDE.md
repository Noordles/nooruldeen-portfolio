# Noor / Owner Studio

The admin is reached through **https://nooruldeen.com/admin/** after activation. It opens the protected owner service at **https://admin.nooruldeen.com/admin**. Sign in using the owner identity configured in Cloudflare Access.

**This implementation still needs its account, authentication policy, database, storage and publishing credential provisioned before those addresses provide a working CMS.** See [deployment instructions](DEPLOYMENT.md).

## Everyday controls

- **Save draft** saves the complete working draft privately. It changes nothing on the live website.
- **Preview** shows the current draft, including draft photographs and piano pieces; hidden items remain hidden, inside the existing website.
- **Publish** sends published content to the site repository. GitHub Pages then rebuilds the website through its existing deployment.
- **Check deployment** reports the latest publication's deployment status. A successful repository commit and a successful website deployment are separate steps.

If the same draft is edited in two tabs, saving an outdated tab is refused. Keep your changes in one tab until they have been saved.

## Edit wording

1. Choose **Website content** to edit wording, links or images repeated across the website, or choose a page under **Pages** for its own content.
2. Select a section and language where applicable.
3. Edit the text. Fields accept plain text; existing typography and nested heading styles remain in the page template.
4. Save, preview, then publish.

The language choices are English, Romanian and Arabic. A language field without an override keeps the website's current language behavior. **Restore defaults** removes that language's override.

Links must be ordinary website, HTTPS/HTTP, email or telephone links. Image selectors reuse the media library. Scripts, source code, decorative icons and animations are not content editor fields.

## Add photographs from your phone

1. Open **Photography**.
2. Enter the gallery or section to upload into.
3. Tap **Upload photographs** and choose one or several files.
4. Select a photograph to set its title, caption, alt text and gallery.
5. Move it with the up/down arrows, or drag it on a computer.
6. Change its visibility to **published**, save, preview, then publish.

A new upload starts as a **draft**. Published items appear publicly; hidden and draft items stay off the public page. Changing a photograph's gallery moves it into that gallery. Gallery order follows the first occurrence of each gallery in the ordered collection.

Use **Choose replacement** or **Upload replacement** to change the image while keeping the item in its existing position. Removing an item removes the reference; it does not immediately delete the uploaded original.

Supported photograph formats are JPEG, PNG and WebP, up to 25 MB per original. If your phone exports HEIC, export a JPEG first. The original is retained privately. The website receives WebP copies at up to 900 px for thumbnails and 2600 px for the larger view, without enlarging small images.

## Add a piano piece

1. Open **Piano** and choose **Add piece**.
2. Enter a title, composer, description and optional notes.
3. Add learning status, difficulty or date where useful.
4. Upload or choose an MP3/WAV recording, add an external video link, or provide a MIDI download link.
5. Optionally choose a thumbnail.
6. Set visibility, reorder, save, preview and publish.

The four existing performances keep their original player and downloads when edited as text. Uploaded recordings use the same track-card design and progress controls. MIDI files are downloads; browser recording playback uses MP3 or WAV.

## Media library

The library combines existing site images and uploaded files. Search by title or filename and reuse an image instead of uploading another copy. Identical uploaded originals are detected by their file hash.

**Download private original** is available only inside an authenticated owner session. Unused uploads can be deleted. A file referenced by a saved draft or published content cannot be deleted. Previously published uploads are retained until the latest website deployment succeeds and at least 24 hours have passed since publication, so cached pages remain usable.

Hiding an item removes it from the page. A file that was previously published can still be available through an existing URL or browser cache until it is eligible for deletion.

## Backup and sign out

In **Settings**, download a content backup before major edits. Restore a backup into the private draft, then preview before publishing. The backup includes content and media references, not the image/audio file bytes.

Sign out from Settings when finished on a shared device. Authentication is managed by Cloudflare Access; no website password is stored in this project.
