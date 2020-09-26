<template>
  <section class="section">
    <title-bar>
      {{$route.meta.title}}
      <b-button type="is-primary" icon-left="arrow-left" slot="button" @click="$router.go(-1)">Back</b-button>
    </title-bar>
  </section>
</template>

<script>
import TitleBar from '@/components/TitleBar'

export default {
    name: 'Reports',
    components: { TitleBar }
}
</script>

<style>

</style>