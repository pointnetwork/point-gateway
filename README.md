# Point Gataway

A proxy to provide web 2.0 access to point network

# Usage
npm install
npm run build
npm run start


It will download latests point-node version. The node will run locally and will be expose to the web2 world through the gateway service.
On webpages the pointsdk will be injected.
Also metamask will be removed

Tasks:

  - [x] Inject scripts into body (point sdki)
  - [x] Remove metamask/ethereum from window object
  - [] Show popup inviting to download point browser for write-action
  - [x] Download latest point-node and execute it (working with linux)
  - [x] Automatically self-update
  - [x] 0 downtime on update
  - [x] Self-restart in case of failures (use pm2)
  - [] report if failure is fatal (e.g. no more disk space),
  - [] Add readme with explanation