# Deployment Philosophy

## Default Posture

TermiWeb is a workstation tool first.

The default deployment story should stay simple:

- one Windows machine
- one trusted operator or a small trusted group
- one configured app password
- one private network such as localhost, a home LAN, an office LAN, or a private overlay network

That is the product's normal operating mode in `0.1`. It should not require a homelab, reverse proxy stack, or internet-facing setup to make sense.

## Advanced WAN Access

Some users will still want to reach their workstation from farther away. That is a legitimate use case, not misuse.

In `0.1`, TermiWeb should make room for careful WAN exposure by operators who already manage their own edge controls. Common patterns include:

- TLS termination
- external authentication
- a reverse proxy
- a private VPN or mesh network
- IP restrictions or equivalent ingress policy
- other hardened ingress paths the operator already trusts

Those are real deployment patterns for TermiWeb. They are not built into the app itself, but the docs should support them clearly.

## 0.1 Boundaries

Version `0.1` does not ship:

- multi-user identity and authorization
- built-in TLS termination
- turnkey public exposure
- a claim that the configured app password alone is a complete WAN security posture

That does not mean WAN exposure is off-limits. It means the surrounding deployment and security model is operator-managed in `0.1`.

## Product Direction

TermiWeb should keep the simple trusted-network path as the default while also staying compatible with careful operator-managed WAN deployments over time.

That means:

- keep the workstation-first flow clean
- do not assume every user runs a homelab
- actively support serious remote-access users in the docs without pretending the app already ships every edge/security feature itself
- document the difference between current product behavior and operator-managed deployment patterns clearly
