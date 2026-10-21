<ul class="legend">
  <li><span class="marker"></span>New</li>
  <li><span class="marker marker-marked"></span>Marked</li>
  <li><span class="marker marker-done"></span>Done</li>
  <li>
    <span class="multiple">
      <span class="marker marker-unsaved"></span>
      <span class="marker marker-marked marker-unsaved"></span>
      <span class="marker marker-done marker-unsaved"></span>
    </span>
    Marker not saved
  </li>
  <li><span class="street-light"></span>Street light</li>
  <li><span class="drawing drawing-polygon"></span>Area</li>
  <li><span class="drawing drawing-circle"></span>POI</li>
  <li><span class="drawing drawing-line"></span>Route</li>
  <li><span class="route-start"></span>Start point</li>
</ul>

<style>
  .legend {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.45rem 0.75rem;
    font-size: var(--fs-sm);
  }

  li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  li:nth-child(4) {
    grid-column: 1 / -1;
  }

  li > :first-child {
    flex: none;
  }

  .route-start {
    display: block;
    width: 0.6rem;
    height: 0.6rem;
    margin: 0 0.1rem;
    background-color: var(--c-base-600);
    border-radius: 999px;
    box-shadow: 0 0 0 2px white;
  }

  .multiple {
    display: flex;
    gap: 0.2rem;
  }

  .marker {
    display: block;
    width: 0.8rem;
    height: 0.8rem;
    background-color: #e11d48;
    border-radius: 999px;
    box-sizing: border-box;
  }

  .marker-marked {
    background-color: #eab308;
  }

  .marker-done {
    background-color: #16a34a;
  }

  .marker-unsaved {
    border: 2px solid orange;
  }

  .street-light {
    display: block;
    width: 5px;
    height: 5px;
    margin: 0 0.3rem;
    background-color: red;
    border-radius: 999px;
  }

  .drawing {
    display: block;
    border: 2px solid var(--c-base-600);
    box-sizing: border-box;
  }

  .drawing-polygon {
    width: 1.4rem;
    height: 0.8rem;
  }

  .drawing-circle {
    width: 0.8rem;
    height: 0.8rem;
    border-radius: 999px;
  }

  .drawing-line {
    border-width: 2px 0 0 0;
    width: 1.4rem;
  }
</style>
