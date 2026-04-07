# Deployment Philosophy

## Default Posture

TermiWeb is a workstation tool first.

The default deployment story should stay simple:

- one Windows machine
- one trusted operator or a small trusted group
- one shared password
- one private network such as localhost, a home LAN, an office LAN, or a private overlay network

That is the product's normal operating mode in `0.1`. It should not require a homelab, reverse proxy stack, or internet-facing setup to make sense.

## Advanced Remote Access

Some users will still want to reach their workstation from farther away. The docs should make room for that without pretending TermiWeb already ships a full remote-access platform.

In practice, advanced operators may choose to layer TermiWeb behind infrastructure they already trust, such as:

- a private VPN or mesh network
- a reverse proxy with TLS
- an external authentication layer
- a hardened self-hosted ingress path they already manage

Those are deployment choices around TermiWeb, not built-in `0.1` product features.

## What 0.1 Does Not Claim

Version `0.1` does not ship:

- multi-user identity and authorization
- built-in TLS termination
- internet-ready hardening or turnkey public exposure
- claims of safe direct exposure to the public internet

If users deploy it beyond a trusted private network, they are responsible for the surrounding security model.

## Product Direction

TermiWeb should keep the simple trusted-network path as the default while staying compatible with more advanced operator-managed deployments over time.

That means:

- keep the workstation-first flow clean
- do not assume every user runs a homelab
- do not block serious remote-access users from layering TermiWeb into their own infrastructure
- document the difference between current product behavior and operator-managed deployment patterns clearly
