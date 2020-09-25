<template>
  <div>
    <discussion-post-form :subjectCode="subjectCode" @finished="getPosts()" />
    <discussion-post v-for="post in posts" 
      :key="post.postId" :post="post" :subjectCode="subjectCode" 
      @deletePost="deletePost(post.postId)" @editPost="editPost(post)"/>
    <!--
    <div v-for="(post, index) in posts" :key="post.postId" class="card">
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
                <span class="is-size-6 has-text-weight-bold">{{ post.author.name }} </span>
                <span class="is-size-7"> {{ post.createdAt }}</span>
                <br />
                {{ post.content }}
              </p>
            </div>
            <nav v-if="post.attachments.length > 0" class="level is-mobile">
              <div class="level-left">
                <b-taglist>
                  <b-tag v-for="(attachment, i) in post.attachments" :key="i" ellipsis>
                    <a :href="attachment.downloadUrl">{{ attachment.fileName }}</a>
                  </b-tag>
                </b-taglist>
              </div>
            </nav>
            <nav class="level is-mobile">
              <div class="level-left">
                <a @click="getPostReply(post.postId, index)" class="level-item">View Replies</a>
              </div>
            </nav>
            <article v-for="reply in postReplies[index]" :key="reply.replyId" class="media">
                <figure class="media-left">
                    <p v-if="reply.author.photoUrl" class="image is-48x48">
                    <img class="is-rounded" :src="reply.author.photoUrl" />
                    </p>
                    <user-avatar v-else :userName="reply.author.name" size="small" />
                </figure>
                <div class="media-content">
                    <div class="content">
                        <p>
                            <span class="is-size-6 has-text-weight-bold">{{ reply.author.name }} </span>
                            <span class="is-size-7"> {{ reply.createdAt }}</span>
                            <br />
                            {{ reply.content }}
                            <br />
                        </p>
                    </div>
                </div>
                <div class="media-right">
                    <a href="#" aria-label="more options">
                    <b-icon icon="dots-vertical" />
                    </a>
                </div>
            </article>
            <b-field>
              <b-input
                v-model="postReply[index]"
                expanded
                placeholder="Type your reply..."
                icon="comment"
              ></b-input>
              <p class="control">
                <b-button @click="createPostReply(post.postId, index)" :disabled="!postReply[index]" icon-left="send"></b-button>
              </p>
            </b-field>
          </div>
          <div class="media-right">
            <a href="#" aria-label="more options">
              <b-icon icon="dots-vertical" />
            </a>
          </div>
        </article>
      </div>
    </div>
    
    <div class="card">
      <div class="card-content">
        <article class="media">
          <figure class="media-left">
            <user-avatar userName="j s" size="small" />
          </figure>
          <div class="media-content">
            <div class="content">
              <p>
                <strong>John Smith</strong>
                <small>@johnsmith</small>
                <small>31m</small>
                <br />Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ornare magna eros, eu pellentesque tortor vestibulum ut. Maecenas non massa sem. Etiam finibus odio quis feugiat facilisis.
              </p>
            </div>
            <nav class="level is-mobile">
              <div class="level-left">
                <a class="level-item">Like</a>
                <a class="level-item">Share</a>
                <a class="level-item">comment</a>
              </div>
            </nav>
            <article class="media">
              <figure class="media-left">
                <user-avatar userName="Sean Brown" size="small" />
              </figure>
              <div class="media-content">
                <div class="content">
                  <p>
                    <strong>Sean Brown</strong>
                    <br />Donec sollicitudin urna eget eros malesuada sagittis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aliquam blandit nisl a nulla sagittis, a lobortis leo feugiat.
                    <br />
                    <small>
                      <a>Like</a> ·
                      <a>Reply</a> · 2 hrs
                    </small>
                  </p>
                </div>
              </div>
              <div class="media-right">
                <a href="#" aria-label="more options">
                  <b-icon icon="dots-vertical" />
                </a>
              </div>
            </article>
            <b-field>
              <b-input expanded placeholder="Add your reply..." icon="comment"></b-input>
              <p class="control">
                <b-button icon-left="send"></b-button>
              </p>
            </b-field>
          </div>
          <div class="media-right">
            <a href="#" aria-label="more options">
              <b-icon icon="dots-vertical" />
            </a>
          </div>
        </article>
      </div>
    </div>
    <div class="card">
      <div class="card-content">
        <article class="media">
          <figure class="media-left">
            <user-avatar userName="j s" size="small" />
          </figure>
          <div class="media-content">
            <div class="content">
              <p>
                <strong>John Smith</strong>
                <small>@johnsmith</small>
                <small>31m</small>
              </p>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ornare magna eros, eu pellentesque tortor vestibulum ut. Maecenas non massa sem. Etiam finibus odio quis feugiat facilisis.</p>
            </div>
            <nav class="level is-mobile">
              <div class="level-left">
                <a class="level-item">Like</a>
                <a class="level-item">Share</a>
                <a class="level-item">comment</a>
              </div>
            </nav>
            <article class="media">
              <figure class="media-left">
                <p v-if="user.photoUrl" class="image is-48x48">
                  <img class="is-rounded" :src="user.photoUrl" />
                </p>
                <user-avatar v-else :userName="user.name" size="small" />
              </figure>
              <div class="media-content">
                <b-field>
                  <b-input expanded placeholder="Add your reply..." icon="comment"></b-input>
                  <p class="control">
                    <b-button icon-left="send"></b-button>
                  </p>
                </b-field>
              </div>
            </article>
          </div>
          <div class="media-right">
            <a href="#" aria-label="more options">
              <b-icon icon="dots-vertical" />
            </a>
          </div>
        </article>
      </div>
    </div>
    -->
    <b-modal :aria-modal="true" :active.sync="isPostEditing" :width="600">
      <discussion-post-form
        :subjectCode="subjectCode"
        :isEditing="isPostEditing"
        :formData="postData"
        @finished="getPosts()" />
    </b-modal>
  </div>
</template>

<script>
import DiscussionPostForm from "@/components/DiscussionPostForm"
//import DiscussionPostEditForm from "@/components/DiscussionPostEditForm"
import DiscussionPost from "@/components/DiscussionPost"
import {mapState} from 'vuex'

import {db} from '../firebase'

export default {
  name: "SubjectDiscussions",
  components: {  DiscussionPostForm, DiscussionPost },
  props: {
    subjectCode: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      posts: [],

      isPostEditing: false,
      postData: null
    }
  },
  computed: {
    ...mapState(['user','userRole']),
  },
  methods: {
    getPosts() {
      let posts = []
      db.collection('subjects').doc(this.subjectCode)
        .collection('discussions').orderBy('createdAt','desc').get()
        .then(snapshot => {
            snapshot.forEach(doc => {
            posts.push({ postId: doc.id, ...doc.data(), 
            createdAt: doc.data().createdAt.toDate(), modifiedAt: doc.data().modifiedAt.toDate() })})
            this.posts = posts
        })
        .catch(e => console.log(e))
    },
    async deletePost(postId) {
        await db.collection('subjects').doc(this.subjectCode).collection('discussions')
                .doc(postId).delete()
        const posts = this.posts.filter(post => postId !== post.postId)
        this.posts = posts
        this.$buefy.snackbar.open({
              message: 'Post Deleted',
              queue: false
            })
    },
    editPost(post) {
      this.postData = post
      this.isPostEditing = true
    }
  },
  created() {
    this.getPosts()
  }
}
</script>

<style>
</style>