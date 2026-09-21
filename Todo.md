# Watch TODO

## Application Core Evaluation

`Cable.tick()` evaluates coaxial strands and intentionally leaves the cable
core as structural topology. Applications with an actively evolving core
workflow must evaluate that core explicitly at the application boundary.

The fulfillment application currently does this in `FulfillmentWatch.tick()`.

## Future API

- Consider adding an explicit `tickCore` or `tickAllWorkflows` API.
- Preserve the distinction between structural cores and coaxial workflow
  strands.
- Add a first-class reconciliation API for dynamic `Strand` instances so
  applications do not need to replace the runtime `instances` collection.
- Add tests covering core evaluation, dynamic instance reconciliation, and
  active-frame reports across repeated workflow runs.