# First Run

These steps assume you are using an unpacked TermiWeb release package on a Windows workstation.

## Preferred Path

Run `Set Up TermiWeb.cmd` if you want TermiWeb to walk you through first-run setup, including the optional before-sign-in auto-start step.

If you enable that auto-start option, Windows will ask for elevation and then for the password of the Windows account that should own the before-sign-in startup task.

If Windows shows a firewall prompt on first launch, allow private-network access if you want phones or other LAN devices on your network to reach the workstation copy.

If you prefer to configure things manually, use the steps below.

## 1. Configure TermiWeb

1. Copy `.env.example` to `.env`.
2. Set `TERMIWEB_PASSWORD` in `.env` before you start TermiWeb for the first time.
3. Leave `TERMIWEB_PORT=22443` unless you have a reason to move the packaged release off the default port.
4. Run `Enable TermiWeb Auto Start.cmd` later if you decide you want the optional before-sign-in startup task after setup.

## 2. Start TermiWeb

1. Run `Start TermiWeb.cmd`.
2. Wait a moment for the server to start in the background.
3. If Windows shows a firewall prompt and you want LAN access, allow private-network access for that first launch.
4. Open `http://127.0.0.1:22443` on the workstation.

## 3. Sign In On The Workstation

1. Enter the password you set in `.env`.
2. After login, TermiWeb should open with a seeded shared shell named `Instance 1`.

## 4. Open The Same Shell From Another Device

1. Make sure the second device is on the same network as the workstation.
2. Find the workstation's LAN IP address.
3. Open `http://<your-pc-lan-ip>:22443` on the second device.
4. Sign in with the same configured app password.
5. Confirm that both devices show the same live `Instance 1` shell.

## 5. If `Instance 1` Is Gone

If you already closed the seeded shell, use `+ New Instance` to create another shared terminal.
