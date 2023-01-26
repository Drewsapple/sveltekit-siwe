<script lang="ts">
    import type { PageServerData } from "./$types"
    export let data: PageServerData;
</script>

<div>
    <p>You're logged in</p>
    <p>User: {data.user.name}</p>
</div>