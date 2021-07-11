<script>
export default {}
</script>

<template>
  <div class="bg-secondary p-20">
    <h3>Rich text</h3>
    <p class="my-10">
      You can add bold, italic, and other styles to the templates. Just select some text and a popup
      toolbar will appear.
    </p>

    <h3>Template variables</h3>
    <p class="my-10">
      You can use special codes in the email templates and they will automatically be replaced with
      the correct value for the invitee.
    </p>
    <div>
      <ul>
        <li><b>FIRST_NAME</b>: The first name of the invitee.</li>
        <li><b>LAST_NAME</b>: The last name of the invitee.</li>
        <li><b>FULL_NAME</b>: The full name of the invitee.</li>
        <li><b>SIGNUP_LINK</b>: The signup link for the selected role.</li>
        <li><b>APPROVED_RECORDS</b>: Submission group approved records.</li>
      </ul>
    </div>
  </div>
</template>
