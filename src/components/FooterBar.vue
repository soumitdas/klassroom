<template>
  <footer v-show="isFooterBarVisible" class="footer">
    <div class="container-fluid">
      <div class="level">
        <div class="level-left">
          <div class="level-item">
            <div>
              <b>Klassroom</b> <span class="tag">v0.1 (alpha)</span>
            </div>
          </div>
        </div>
        <div class="level-right">
          <div class="level-item">
            Made with &hearts; by : <a href="https://www.soumitdas.com/" target="_blank" rel="noopener noreferrer"><b>Soumit Das</b></a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
//import dayjs from 'dayjs'
import { mapState } from 'vuex'

export default {
  name: 'FooterBar',
  computed: {
    ...mapState([
      'isFooterBarVisible'
    ])
  }
}
</script>
