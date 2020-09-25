<template>
  <div class="card">
      <div class="card-content">
        <article class="media">
          <figure class="media-left">
            <p v-if="user.photoUrl" class="image is-48x48">
              <img class="is-rounded" :src="user.photoUrl" />
            </p>
            <user-avatar v-else :userName="user.name" size="small" />
          </figure>
          <div class="media-content">
            <b-field>
              <b-input v-model="content" maxlength="200" type="textarea"></b-input>
            </b-field>
            <nav class="level is-mobile">
              <div class="level-left">
                <div class="level-item">
                  <section v-if="!isEditing">
                    <b-field>
                      <b-upload v-model="files" multiple accept="application/pdf">
                        <a class="button">
                          <b-icon class="file-icon" icon="paperclip"></b-icon>
                          <span class="file-label">Attach</span>
                        </a>
                      </b-upload>
                    </b-field>

                    <b-field grouped group-multiline>
                      <div class="control" v-for="(file, index) in files" :key="index">
                        <b-tag
                          type="is-primary"
                          attached
                          ellipsis
                          aria-close-label="Close tag"
                          closable
                          @close="deleteUploadFile(index)"
                        >{{file.name}}</b-tag>
                      </div>
                    </b-field>
                  </section>
                </div>
              </div>
              <div class="level-right">
                <div v-if="isEditing" class="level-item">
                  <b-button @click="$parent.close()">Close</b-button>
                </div>
                <div class="level-item">
                  <b-button
                    type="is-primary"
                    :loading="isPostButtonLoading"
                    :disabled="!content.length"
                    @click="createOrUpdatePost">
                      {{ isEditing ? 'Update' : 'Post' }}
                  </b-button>
                </div>
              </div>
            </nav>
          </div>
        </article>
      </div>
    </div>
</template>

<script>
import UserAvatar from "@/components/UserAvatar"
import {mapState} from 'vuex'

import {db, firebase, storage} from '../firebase'

export default {
  name: 'DiscussionPostForm',
  components: { UserAvatar },
  props: {
    subjectCode: {
      type: String,
      required: true
    },
    isEditing: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      content: '',
      files: [],
      isPostButtonLoading: false,
    }
  },
  computed: {
    ...mapState(['user','userRole']),
  },
  methods: {
    deleteUploadFile(index) {
      this.files.splice(index, 1)
    },
    
    uploadFiles() {
      const storageRef = storage.ref(this.subjectCode).child('discussions')

      const promises = this.files.map(file => {
        const ref = storageRef.child(`${new Date().getTime()}_${file.name}`)
        return ref.put(file).then(() => ref.getDownloadURL()).then(downloadUrl => ({ fileName: file.name, downloadUrl }))
      })

      return Promise.all(promises)
    },
    createOrUpdatePost() {
      if (this.$props.isEditing) {
        this.updatePost()
      } else {
        this.createPost()
      }
    },

    async createPost() {
      try {
        this.isPostButtonLoading = true
        let attachments = []
        if (this.files.length > 0) {
            attachments = await this.uploadFiles()
        }
        const postData = {
            content: this.content,
            author: {
            uid: this.user.uid,
            name: this.user.name,
            photoUrl: this.user.photoUrl,
            role: this.userRole[0]
            },
            attachments,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            modifiedAt: firebase.firestore.FieldValue.serverTimestamp()
        }

        await db.collection('subjects').doc(this.subjectCode)
                .collection('discussions').add(postData)
        
        this.$buefy.snackbar.open({
              message: 'Your Post Added',
              queue: false
            })

        this.isPostButtonLoading = false
        this.content = ''
        this.files = []
        this.$emit('finished')
      } catch (e) {
        this.isPostButtonLoading = false
        this.$buefy.toast.open({
          message: `Error: ${e.message}`,
          type: "is-danger",
          queue: false
        })
        console.error(e)
      }
    },
    async updatePost() {
      try {
        this.isPostButtonLoading = true
        
        const postData = {
            content: this.content,
            modifiedAt: firebase.firestore.FieldValue.serverTimestamp()
        }

        await db.collection('subjects').doc(this.subjectCode)
                .collection('discussions').doc(this.formData.postId)
                .update(postData)
        
        this.isPostButtonLoading = false
        this.$emit('finished')
        this.$parent.close()

        this.$buefy.snackbar.open({
              message: 'Your Post is updated',
              queue: false
            })

      } catch (e) {

        this.isPostButtonLoading = false
        this.$buefy.toast.open({
          message: `Error: ${e.message}`,
          type: "is-danger",
          queue: false
        })
        console.error(e)
      }
    }
  },
  mounted() {
    if (this.$props.isEditing) {
      this.content = this.$props.formData.content
    }
  }
}
</script>
