<script lang="ts">
</script>

<ul>
  <li>
    Markierung Neu
    <span class="marker"></span>
  </li>
  <li>
    Markierung Entfernt
    <span class="marker marker-removed"></span>
  </li>
  <li>
    Markierung Abgelehnt
    <span class="marker marker-damaged"></span>
  </li>
  <li>
    Markierung nicht gespeichert
    <div class="multiple">
      <span class="marker marker-unsaved"></span>
      <span class="marker marker-removed marker-unsaved"></span>
      <span class="marker marker-damaged marker-unsaved"></span>
    </div>
  </li>
  <li>
    Laterne
    <span class="street-light"></span>
  </li>
  <li>
    Bereich
    <span class="drawing drawing-polygon"></span>
  </li>
  <li>
    POI
    <span class="drawing drawing-circle"></span>
  </li>
  <li>
    Route
    <span class="drawing drawing-line"></span>
  </li>
  <li>
    Startpunkt
    <img src="/route-start-symbol.png" alt="" />
  </li>
</ul>

<style>
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.5rem 1rem;
    align-items: center;
    justify-items: stretch;
  }

  li {
    display: contents;
  }

  img {
    height: 1.5rem;
    width: auto;
    justify-self: start;
  }

  .multiple {
    display: flex;
    gap: 0.25rem;
  }

  .marker {
    display: block;
    width: 1rem;
    height: 1rem;
    background-color: #008939;
    border-radius: 999px;
  }

  .marker-removed {
    background-color: #55555555;
  }

  .marker-damaged {
    background-color: red;
  }

  .marker-unsaved {
    border: 3px solid orange;
  }

  .street-light {
    display: block;
    width: 5px;
    height: 5px;
    background-color: red;
    border-radius: 999px;
  }

  .drawing {
    display: block;
    border: 3px solid black;
  }

  .drawing-polygon {
    width: 2rem;
    height: 1rem;
  }

  .drawing-circle {
    width: 1rem;
    height: 1rem;
    border-radius: 999px;
  }

  .drawing-line {
    border-width: 3px 0 0 0;
    width: 2rem;
  }
</style>
