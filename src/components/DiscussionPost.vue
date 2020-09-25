<template>
  <div class="card">
    <div class="card-content">
      <article class="media">
        <figure class="media-left">
          <p v-if="post.author.photoUrl" class="image is-48x48">
            <img class="is-rounded" :src="post.author.photoUrl" />
          </p>
          <user-avatar v-else :userName="post.author.name" size="small" />
        </figure>
        <div class="media-content">
          <div class="content">
            <p>
              <span class="is-size-6 has-text-weight-bold">{{ post.author.name }}</span>
              <span class="is-size-7"> {{ post.createdAt.toDateString() }}</span>
              <br />
              {{ post.content }}
            </p>
          </div>
          <nav v-if="post.attachments.length > 0" class="level is-mobile">
            <div class="level-left">
              <b-taglist>
                <b-tag v-for="(attachment, i) in post.attachments" :key="i" ellipsis>
                  <a :href="attachment.downloadUrl" target="_blank" rel="noopener noreferrer">{{ attachment.fileName }}</a>
                </b-tag>
              </b-taglist>
            </div>
          </nav>
          <article v-show="!isReplyLoaded" class="media">
            <div class="media-content">
              <div class="content">
                <p>
                  <small>
                    <a @click="getPostReply(post.postId)">View Replies</a>
                  </small>
                </p>
              </div>
            </div>
          </article>
          <article v-for="reply in replies" :key="reply.id" class="media">
            <figure class="media-left">
              <p v-if="reply.author.photoUrl" class="image is-48x48">
                <img class="is-rounded" :src="reply.author.photoUrl" />
              </p>
              <user-avatar v-else :userName="reply.author.name" size="small" />
            </figure>
            <div class="media-content">
              <div class="content">
                <p>
                  <span class="is-size-6 has-text-weight-bold">{{ reply.author.name }}</span>
                  <span class="is-size-7"> {{ reply.createdAt.toDateString() }}</span>
                  <br />
                  {{ reply.content }}
                  <br />
                </p>
              </div>
            </div>
            <div v-if="reply.author.uid === user.uid" class="media-right">
              <b-dropdown position="is-bottom-left" :mobile-modal="false" aria-role="list">
                <a aria-label="more options" slot="trigger">
                    <b-icon icon="dots-vertical" />
                </a>
                <b-dropdown-item @click="deletePostReply(reply.id)" aria-role="listitem">Delete</b-dropdown-item>
              </b-dropdown>
            </div>
          </article>
          <form @submit.prevent="createPostReply(post.postId)">
            <b-field>
                <b-input v-model="postReply" expanded placeholder="Type your reply..." icon="comment"></b-input>
                <p class="control">
                <b-button :disabled="postReply < 1" :loading="isReplyLoading" icon-left="send"></b-button>
                </p>
            </b-field>
          </form>
        </div>
        <div v-if="post.author.uid === user.uid" class="media-right">
            <b-dropdown position="is-bottom-left" :mobile-modal="false" aria-role="list">
                <a aria-label="more options" slot="trigger">
                    <b-icon icon="dots-vertical" />
                </a>
                <b-dropdown-item @click="editPost" aria-role="listitem">Edit</b-dropdown-item>
                <b-dropdown-item @click="deletePost" aria-role="listitem">Delete</b-dropdown-item>
            </b-dropdown>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
import UserAvatar from "@/components/UserAvatar";
import {mapState} from 'vuex'
import { db, firebase } from "../firebase";

export default {
  name: "DiscussionPost",
  components: { UserAvatar },
  props: {
    post: {
      type: Object,
      required: true,
    },
    subjectCode: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isReplyLoaded: false,
      replies: [],
      postReply: '',
      isReplyLoading: false
    };
  },
  computed: {
    ...mapState(['user','userRole']),
  },
  methods: {
    getPostReply(postId) {
      let replies = [];
      db.collection("subjects")
        .doc(this.subjectCode)
        .collection("discussions")
        .doc(postId)
        .collection("replies")
        .orderBy('createdAt')
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            replies.push({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt.toDate(),
              modifiedAt: doc.data().modifiedAt.toDate(),
            });
          });
          this.replies = replies;
          this.isReplyLoaded = true;
        })
        .catch((e) => console.log(e));
    },
    createPostReply(postId) {
        this.isReplyLoading = true
      const postReply = {
        content: this.postReply,
        author: {
          uid: this.user.uid,
          name: this.user.name,
          photoUrl: this.user.photoUrl,
          role: this.userRole[0]
        },
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        modifiedAt: firebase.firestore.FieldValue.serverTimestamp()
      }
      db.collection('subjects')
        .doc(this.subjectCode)
        .collection('discussions')
        .doc(postId)
        .collection('replies')
        .add(postReply)
        .then(() => {
          this.postReply = ''
          this.isReplyLoading = false
          this.getPostReply(postId)
        })
        .catch(e => {
            this.isReplyLoading = false
            console.error(e)
        })
    },

    async deletePostReply(replyId) {
        await db.collection('subjects').doc(this.subjectCode).collection('discussions')
                .doc(this.post.postId).collection('replies').doc(replyId).delete()
        this.getPostReply(this.post.postId)
    },
    deletePost() {
      this.$buefy.dialog.confirm({
        title: 'Confirm action',
        message: 'This will permanently delete your post. <br>This action can not be undone.',
        confirmText: 'Delete',
        type: 'is-danger',
        hasIcon: true,
        onConfirm: () => this.$emit('deletePost')
      })
    },
    editPost() {
      this.$emit('editPost')
    }
  },
};
</script>
