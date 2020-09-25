<template>
  <div>
    <b-collapse class="card" animation="slide" aria-id="contentIdForA11y3">
      <div
        slot="trigger"
        slot-scope="props"
        class="card-header"
        role="button"
        aria-controls="contentIdForA11y3"
      >
        <p class="card-header-title">
          <b-icon icon="school" custom-size="default" />Assignments 1
        </p>
        <a class="card-header-icon">
          <b-icon :icon="props.open ? 'menu-down' : 'menu-up'"></b-icon>
        </a>
      </div>
      <div class="card-content">
        <div class="content">
          <p>Description: Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt id ut ab repudiandae ipsam, minima veniam, reiciendis, aut ducimus provident maiores dignissimos quasi aspernatur? Quod exercitationem nisi itaque dolor animi?</p>
          <p>Deadline: 1 - 1 - 1900</p>
        </div>
      </div>
      <footer class="card-footer">
        <a class="card-footer-item">View Assignment</a>
      </footer>
    </b-collapse>
  </div>
</template>

<script>
import {db} from '../firebase'

export default {
  name: "SubjectAssignments"
}
</script>

<style>
</style>