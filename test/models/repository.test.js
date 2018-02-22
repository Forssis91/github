import {getPackageRoot, writeFile, copyFile, fsStat, getTempDir, realPath} from '../../lib/helpers';
      const soonToBeRepositoryPath = await realPath(temp.mkdirSync());
      const destDir = await realPath(temp.mkdirSync());
      const parentDir = await realPath(temp.mkdirSync());
      const filePatch1 = await repo.getFilePatchForPath('file.txt', {staged: true, amending: true});
      assert.equal(filePatch1.getOldPath(), 'file.txt');
      assert.equal(filePatch1.getNewPath(), 'file.txt');
      assert.equal(filePatch1.getStatus(), 'modified');
      assertDeepPropertyVals(filePatch1.getHunks(), [
        {
          lines: [
            {status: 'deleted', text: 'two', oldLineNumber: 1, newLineNumber: -1},
            {status: 'added', text: 'three', oldLineNumber: -1, newLineNumber: 1},
          ],
        },
      ]);
      const filePatch2 = await repo.getFilePatchForPath('file.txt', {staged: true, amending: true});
      assert.equal(filePatch2.getOldPath(), 'file.txt');
      assert.equal(filePatch2.getNewPath(), 'file.txt');
      assert.equal(filePatch2.getStatus(), 'modified');
      assertDeepPropertyVals(filePatch2.getHunks(), [
        {
          lines: [
            {status: 'deleted', text: 'two', oldLineNumber: 1, newLineNumber: -1},
            {status: 'added', text: 'three', oldLineNumber: -1, newLineNumber: 1},
            {status: 'added', text: 'four', oldLineNumber: -1, newLineNumber: 2},
          ],
        },
      ]);

    it('can stage and unstage file modes without staging file contents', async function() {
      const workingDirPath = await cloneRepository('three-files');
      const repo = new Repository(workingDirPath);
      await repo.getLoadPromise();
      const filePath = 'a.txt';

      async function indexModeAndOid(filename) {
        const output = await repo.git.exec(['ls-files', '-s', '--', filename]);
        const parts = output.split(' ');
        return {mode: parts[0], oid: parts[1]};
      }

      const {mode, oid} = await indexModeAndOid(path.join(workingDirPath, filePath));
      assert.equal(mode, '100644');
      fs.chmodSync(path.join(workingDirPath, filePath), 0o755);
      fs.writeFileSync(path.join(workingDirPath, filePath), 'qux\nfoo\nbar\n', 'utf8');

      await repo.stageFileModeChange(filePath, '100755');
      assert.deepEqual(await indexModeAndOid(filePath), {mode: '100755', oid});

      await repo.stageFileModeChange(filePath, '100644');
      assert.deepEqual(await indexModeAndOid(filePath), {mode: '100644', oid});
    });

    it('can stage and unstage symlink changes without staging file contents', async function() {
      const workingDirPath = await cloneRepository('symlinks');
      const repo = new Repository(workingDirPath);
      await repo.getLoadPromise();

      async function indexModeAndOid(filename) {
        const output = await repo.git.exec(['ls-files', '-s', '--', filename]);
        if (output) {
          const parts = output.split(' ');
          return {mode: parts[0], oid: parts[1]};
        } else {
          return null;
        }
      }

      const deletedSymlinkAddedFilePath = 'symlink.txt';
      fs.unlinkSync(path.join(workingDirPath, deletedSymlinkAddedFilePath));
      fs.writeFileSync(path.join(workingDirPath, deletedSymlinkAddedFilePath), 'qux\nfoo\nbar\n', 'utf8');

      const deletedFileAddedSymlinkPath = 'a.txt';
      fs.unlinkSync(path.join(workingDirPath, deletedFileAddedSymlinkPath));
      fs.symlinkSync(path.join(workingDirPath, 'regular-file.txt'), path.join(workingDirPath, deletedFileAddedSymlinkPath));

      // Stage symlink change, leaving added file unstaged
      assert.equal((await indexModeAndOid(deletedSymlinkAddedFilePath)).mode, '120000');
      await repo.stageFileSymlinkChange(deletedSymlinkAddedFilePath);
      assert.isNull(await indexModeAndOid(deletedSymlinkAddedFilePath));
      const unstagedFilePatch = await repo.getFilePatchForPath(deletedSymlinkAddedFilePath, {staged: false});
      assert.equal(unstagedFilePatch.getStatus(), 'added');
      assert.equal(unstagedFilePatch.toString(), dedent`
        diff --git a/symlink.txt b/symlink.txt
        new file mode 100644
        --- /dev/null
        +++ b/symlink.txt
        @@ -0,0 +1,3 @@
        +qux
        +foo
        +bar

      `);

      // Unstage symlink change, leaving deleted file staged
      await repo.stageFiles([deletedFileAddedSymlinkPath]);
      assert.equal((await indexModeAndOid(deletedFileAddedSymlinkPath)).mode, '120000');
      await repo.stageFileSymlinkChange(deletedFileAddedSymlinkPath);
      assert.isNull(await indexModeAndOid(deletedFileAddedSymlinkPath));
      const stagedFilePatch = await repo.getFilePatchForPath(deletedFileAddedSymlinkPath, {staged: true});
      assert.equal(stagedFilePatch.getStatus(), 'deleted');
      assert.equal(stagedFilePatch.toString(), dedent`
        diff --git a/a.txt b/a.txt
        deleted file mode 100644
        --- a/a.txt
        +++ /dev/null
        @@ -1,4 +0,0 @@
        -foo
        -bar
        -baz
        -

      `);
    });
    let rp = '';
      rp = process.env.PATH;
      process.env.PATH = rp;
        const workdir = await cloneRepository('multi-commits-files');
        const workdir = await cloneRepository('multi-commits-files');
          await repository.git.applyPatch(patch.toString(), {index: true});
          await repository.git.applyPatch(patch.toString());