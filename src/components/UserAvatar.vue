<template>
  <div :class="avatarClass">
     <span class="initials">{{nameInitials}}</span>
   </div>
</template>

<script>
export default {
    name: 'UserAvatar',
    props: {
        userName: {
            type: String,
            required: true,
            default: 'A'
        },
        size: {
            type: String,
            default: ''
        }
    },
    computed: {
        nameInitials() {
            return this.userName.split(' ').map(n => n[0]).join('').substr(0,2).toUpperCase()
        },
        avatarClass() {
            if (this.size !== '') {
                return 'avatar-circle' + '-' + this.size
            }
            return 'avatar-circle'
        }
    },

}
</script>

<style lang="scss" scoped>
@mixin avatar($size) {
    width: $size;
    height: $size;
    background-color: #32a8a2;
    text-align: center;
    border-radius: 50%;
    -webkit-border-radius: 50%;
    -moz-border-radius: 50%;

    .initials {
      position: relative;
      top: $size / 4;
      font-size: $size / 2;
      line-height: $size / 2;
      color: #fff;
      font-family: monospace;
      font-weight: bold;
    }
}

.avatar-circle      { @include avatar(100px); }
.avatar-circle-small   { @include avatar(48px); }
.avatar-circle-large   { @include avatar(250px); }
.avatar-circle-nav  { 
    $size: 1.75rem;
    @include avatar($size);
    .initials {
        top: 0.1rem;
    }
}
</style>